const User = require('../models/User');

// Helper function to check if user is owner or superadmin
const isOwnerOrSuperAdmin = (req, userId) => {
  return req.user._id.toString() === userId || req.user.role === 'superadmin';
};

// Create Delivery Address
const createDeliveryAddress = async (req, res) => {
  const { address, userId } = req.body;

  try {
    if (!isOwnerOrSuperAdmin(req, userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.deliveryAddresses.push({ address });
    await user.save();

    res.status(201).json({ message: 'Delivery address added successfully' });
  } catch (err) {
    console.error('Error adding delivery address:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Delivery Address
const updateDeliveryAddress = async (req, res) => {
  const { addressId, address, isActive, userId } = req.body;

  try {
    if (!isOwnerOrSuperAdmin(req, userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deliveryAddress = user.deliveryAddresses.id(addressId);
    if (!deliveryAddress) {
      return res.status(404).json({ error: 'Delivery address not found' });
    }

    deliveryAddress.address = address || deliveryAddress.address;
    deliveryAddress.isActive = isActive !== undefined ? isActive : deliveryAddress.isActive;

    await user.save();

    res.status(200).json({ message: 'Delivery address updated successfully' });
  } catch (err) {
    console.error('Error updating delivery address:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete Delivery Address
const deleteDeliveryAddress = async (req, res) => {
  const { addressId, userId } = req.body;

  try {
    if (!isOwnerOrSuperAdmin(req, userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.deliveryAddresses.pull(addressId);
    await user.save();

    res.status(200).json({ message: 'Delivery address deleted successfully' });
  } catch (err) {
    console.error('Error deleting delivery address:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get All Delivery Addresses
const getAllDeliveryAddresses = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!isOwnerOrSuperAdmin(req, userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user.deliveryAddresses);
  } catch (err) {
    console.error('Error getting delivery addresses:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get All User Information (Superadmin Only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords
    res.status(200).json(users);
  } catch (err) {
    console.error('Error getting users:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user role using phone number
const updateUserRole = async (req, res) => {
  const { phoneNumber, role } = req.body;

  if (!['user', 'admin', 'superadmin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { phoneNumber },
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', user });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createDeliveryAddress,
  updateDeliveryAddress,
  deleteDeliveryAddress,
  getAllDeliveryAddresses,
  getAllUsers,
  updateUserRole,
};
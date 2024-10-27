const User = require('../models/User');

const isOwnerOrSuperAdmin = (req, userId) => {
  return req.user._id.toString() === userId || req.user.role === 'superadmin';
};

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

const getUserDetails = async (req, res) => {
  const { userId } = req.params; // Get userId from URL parameters

  try {
    // Ensure that the authenticated user is either the owner or a superadmin
    if (!isOwnerOrSuperAdmin(req, userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId).select('-password'); // Exclude password from the response
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
 
    res.json(user);
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ error: 'Server error' });
  }
};



const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    res.status(200).json(users);
  } catch (err) {
    console.error('Error getting users:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

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

const updateUserEmail = async (req, res) => {
  const { email } = req.body;

  try {
      const user = await User.findById(req.user._id);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      if (email) {
          user.email = email;
          await user.save();
          return res.status(200).json({ message: 'Email updated successfully' });
      } else {
          return res.status(400).json({ error: 'Email is required' });
      }
  } catch (err) {
      console.error('Error updating email:', err);
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
  updateUserEmail,
  getUserDetails,
};
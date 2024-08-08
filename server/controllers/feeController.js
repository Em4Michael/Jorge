// controllers/feeController.js
const Fee = require('../models/Fee');

// Create a new fee
exports.createFee = async (req, res) => {
  try {
    const { deliveryFee, taxRate } = req.body;

    const fee = new Fee({ deliveryFee, taxRate });
    await fee.save();

    res.status(201).json({ message: 'Fee created successfully', fee });
  } catch (error) {
    console.error('Error creating fee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get the most recent fee
exports.getRecentFee = async (req, res) => {
  try {
    const fee = await Fee.findOne().sort({ createdAt: -1 });
    if (!fee) {
      return res.status(404).json({ error: 'Fee not found' });
    }
    res.status(200).json(fee);
  } catch (error) {
    console.error('Error fetching fee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update the most recent fee
exports.updateRecentFee = async (req, res) => {
    try {
      const { deliveryFee, taxRate } = req.body;
  
      if (deliveryFee === undefined || taxRate === undefined) {
        return res.status(400).json({ error: 'Delivery fee and tax rate are required' });
      }
  
      // Find and update the most recent fee entry
      const updatedFee = await Fee.findOneAndUpdate(
        {},
        { deliveryFee, taxRate, updatedAt: new Date() },
        { new: true, sort: { _id: -1 } } // Sort by _id in descending order to get the most recent
      );
  
      if (!updatedFee) {
        return res.status(404).json({ error: 'Fee not found' });
      }
  
      res.status(200).json({ message: 'Fee updated successfully', fee: updatedFee });
    } catch (error) {
      console.error('Error updating recent fee:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

// Get all fees
exports.getAllFees = async (req, res) => {
  try {
    const fees = await Fee.find();
    res.status(200).json(fees);
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific fee by ID
exports.getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ error: 'Fee not found' });
    }
    res.status(200).json(fee);
  } catch (error) {
    console.error('Error fetching fee by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

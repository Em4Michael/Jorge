const DeviceData = require('../models/DeviceData');

// Fetch all device data
exports.getAllData = async (req, res) => {
  try {
    const data = await DeviceData.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Handle device control actions
exports.controlDevice = (req, res) => {
  const { deviceName, action } = req.body;
  // Handle logic to send control signals to the ESP32
  res.status(200).json({ message: `Device ${deviceName} action ${action} performed` });
};

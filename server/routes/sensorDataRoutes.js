const express = require('express');
const router = express.Router();
const { saveSensorData } = require('../controllers/sensorDataController');

router.post('/sensor-data', async (req, res) => {
  try {
    const sensorData = req.body;
    const savedData = await saveSensorData(sensorData);
    res.status(200).json(savedData);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

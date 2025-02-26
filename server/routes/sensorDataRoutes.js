const express = require('express');
const router = express.Router();
const { saveSensorData } = require('../controllers/sensorDataController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const SensorData = require('../models/SensorData');
const Attendance = require('../models/Attendance');

router.post('/sensor-data', authMiddleware, async (req, res) => {
  try {
    const sensorData = req.body;
    const savedData = await saveSensorData(sensorData);
    res.status(200).json(savedData);
  } catch (error) {
    console.error('Error saving sensor data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/sensor-data/latest', authMiddleware, async (req, res) => {
  try {
    const latestData = await SensorData.findOne().sort({ timestamp: -1 });
    if (!latestData) {
      return res.status(200).json({
        RN: 0, UV: 0, MO: 0, TP: 0, HM: 0, HI: 0,
        Date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        Time: new Date().toLocaleTimeString(),
        timestamp: new Date(),
      });
    }
    res.status(200).json(latestData);
  } catch (error) {
    console.error('Error fetching latest sensor data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}); 

router.get('/attendance', authMiddleware, async (req, res) => {
  try {
    const attendanceData = await Attendance.find({}).sort({ timestamp: -1 });
    res.status(200).json(attendanceData); 
  } catch (error) { 
    console.error('Error fetching attendance data:', error); 
    res.status(500).json({ error: 'Internal Server Error' }); 
  }
});

module.exports = router;
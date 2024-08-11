const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  Date: String,
  Time: String,
  RN: Number,
  UV: Number,
  MO: Number,
  TP: Number,
  HM: Number,
  HI: Number,
  Access: String,
  Exist: String,
  timestamp: { type: Date, default: Date.now }, // New timestamp field
});

const SensorData = mongoose.model('SensorData', sensorDataSchema);

module.exports = SensorData;

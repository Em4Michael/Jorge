const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  Date: String,
  Time: String,
  Access: String,
  Exit: String, // Renamed from Exist
  timestamp: { type: Date, default: Date.now },
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
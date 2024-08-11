const mongoose = require('mongoose');

const deviceDataSchema = new mongoose.Schema({
  Date: { type: String },
  Time: { type: String },
  RN: { type: Number },
  UV: { type: Number },
  MO: { type: Number },
  TP: { type: Number },
  HM: { type: Number },
  HI: { type: Number },
  Access: { type: String },
  Exist: { type: Boolean },
}, { timestamps: true });

module.exports = mongoose.model('DeviceData', deviceDataSchema);

const mongoose = require('mongoose');

const pinStateSchema = new mongoose.Schema({
  pinName: String,
  state: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const PinState = mongoose.model('PinState', pinStateSchema);

module.exports = PinState;
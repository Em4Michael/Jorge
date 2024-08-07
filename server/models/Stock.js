// models/Stock.js
const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  pricePerCarton: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date
  },
  date: {
    type: Date,
    default: Date.now, // This can track the last update or custom date field
  },
});

module.exports = mongoose.model('Stock', stockSchema);

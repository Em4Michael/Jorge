const mongoose = require('mongoose');

const plantReportSchema = new mongoose.Schema({
  plantTag: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{1,3}[AB]$/, 'Please enter a valid plant tag (e.g., 1A, 100B)'],
  },
  productivity: {
    red: { type: Number, default: 0 },
    yellow: { type: Number, default: 0 },
    green: { type: Number, default: 0 },
    flower: { type: Number, default: 0 },
  },
  healthStatus: {
    pest: { type: Boolean, default: false },
    disease: { type: Boolean, default: false },
    defects: { type: Boolean, default: false },
  },
  expected: {
    week1: { amount: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
    week2: { amount: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
    week3: { amount: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
    week4: { amount: { type: Number, default: 0 }, percent: { type: Number, default: 0 } },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PlantReport', plantReportSchema);

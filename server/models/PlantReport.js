// models/PlantReport.js

const mongoose = require('mongoose');

const plantReportSchema = new mongoose.Schema({
  plantTag: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{1,3}[AB]$/, 'Please enter a valid plant tag (e.g., 1A, 100B)'],
  },
  productivity: {
    red: { type: Number, default: 5 },
    yellow: { type: Number, default: 5 },
    green: { type: Number, default: 5 },
    flower: { type: Number, default: 5 },
    productivityPercent: { type: Number, default: 100 } // Stores the calculated productivity percentage
  },
  healthStatus: {
    pest: { type: Boolean, default: false },
    disease: { type: Boolean, default: false },
    defects: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PlantReport', plantReportSchema);

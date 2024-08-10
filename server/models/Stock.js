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
    stemAmount: {
        type: Number,
        default: 2, 
    },
    totalPlantAmount: {
        type: Number,
        default: 500, 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    weeklyCapacity: {
        type: Number,
        required: true
    },
    expectedProductivity: {
        type: Number,
        default: 0,
      },
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Stock', stockSchema);

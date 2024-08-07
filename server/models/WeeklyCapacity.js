// models/WeeklyCapacity.js
const mongoose = require('mongoose');

const weeklyCapacitySchema = new mongoose.Schema({
    capacity: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    }
});

module.exports = mongoose.model('WeeklyCapacity', weeklyCapacitySchema);

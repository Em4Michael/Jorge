// models/Fee.js
const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    deliveryFee: {
        type: Number,
        required: true,
    },
    taxRate: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('Fee', feeSchema);

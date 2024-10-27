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
}, { 
    timestamps: true  // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Fee', feeSchema);

const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    item: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;

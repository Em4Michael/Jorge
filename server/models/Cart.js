// models/Cart.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        ref: 'Stock',
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
});

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [cartItemSchema],
    total: {
        type: Number,
        required: true,
        default: 0,
    },
});

module.exports = mongoose.model('Cart', cartSchema);

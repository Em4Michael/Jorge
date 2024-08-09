const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  pricePerCarton: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);

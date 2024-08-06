const mongoose = require('mongoose');

const UserOrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tomatoesOrdered: { 
        type: Number, 
        required: true 
    },
    orderDate: { 
        type: Date, 
        default: Date.now 
    },
    weekNumber: { 
        type: Number, 
        required: true 
    }
});

module.exports = mongoose.model('UserOrder', UserOrderSchema);

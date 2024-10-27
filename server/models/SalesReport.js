// models/SalesReport.js

const mongoose = require('mongoose');

const salesReportSchema = new mongoose.Schema({
  totalSales: { 
    type: Number, default: 0 
  },
    totalPendingOrders: {
     type: Number, default: 0 
  },
  totalOrders: {
     type: Number, default: 0 
    },
  usersByName: [{
     name: String, count: Number 
    }],
  usersByLocation: [{
     location: String, count: Number 
    }],
  totalPaymentByMethod: {
    card: {
       type: Number, default: 0 
      },
    transfer: {
       type: Number, default: 0 
      }
  },
  actualSales: {
     type: Number, default: 0 
    },
  predictedSales: {
     type: Number, default: 0 
    },
  idealSales: {
     type: Number, default: 0 
    },
  createdAt: {
     type: Date, default: Date.now 
    }
});

module.exports = mongoose.model('SalesReport', salesReportSchema);

const express = require('express');
const { checkout, updateOrderStatus, getOrders } = require('../controllers/checkoutController');const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/checkout', authMiddleware, checkout);
router.put('/order/status', authMiddleware, updateOrderStatus);
router.get('/orders', authMiddleware, getOrders); // Added route for fetching orders

module.exports = router;
 
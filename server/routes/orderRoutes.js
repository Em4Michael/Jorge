const express = require('express');
const { placeOrder } = require('../controllers/orderController');

const router = express.Router();

router.post('/orders/place-order', placeOrder);

module.exports = router;

const express = require('express');
const { getMarkets, processPayment } = require('../controllers/checkoutController');

const router = express.Router();

router.get('/checkout/markets', getMarkets);
router.post('/checkout/process-payment', processPayment);

module.exports = router;

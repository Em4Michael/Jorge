// routes/checkoutRoutes.js
const express = require('express');
const { checkout } = require('../controllers/checkoutController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/checkout', authMiddleware, checkout);

module.exports = router;

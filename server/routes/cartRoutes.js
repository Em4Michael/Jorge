// routes/cartRoutes.js
const express = require('express');
const { addToCart } = require('../controllers/cartController');
const { authMiddleware } = require('../middlewares/authMiddleware'); // Ensure correct import

const router = express.Router();

router.post('/cart', authMiddleware, addToCart);

module.exports = router;

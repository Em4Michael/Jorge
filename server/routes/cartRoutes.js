// routes/cartRoutes.js
const express = require('express');
const { addToCart, updateCartItem, deleteCartItem } = require('../controllers/cartController');
const { authMiddleware } = require('../middlewares/authMiddleware'); // Ensure correct import

const router = express.Router();

router.post('/cart', authMiddleware, addToCart);
router.put('/cart', authMiddleware, updateCartItem); // Update existing cart item
router.delete('/cart', authMiddleware, deleteCartItem); // Delete existing cart item

module.exports = router;

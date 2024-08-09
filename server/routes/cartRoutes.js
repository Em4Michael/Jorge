const express = require('express');
const { addToCart, updateCartItem, deleteCartItem } = require('../controllers/cartController');
const { authMiddleware } = require('../middlewares/authMiddleware'); 

const router = express.Router();

router.post('/cart', authMiddleware, addToCart);
router.put('/cart', authMiddleware, updateCartItem); 
router.delete('/cart', authMiddleware, deleteCartItem); 

module.exports = router;

// controllers/cartController.js
const Cart = require('../models/Cart');
const WeeklyCapacity = require('../models/WeeklyCapacity');
const Stock = require('../models/Stock');

exports.addToCart = async (req, res) => {
  try {
    const { stockId, quantity } = req.body;
    const userId = req.user._id;

    const weeklyCapacity = await WeeklyCapacity.findOne().sort({ startDate: -1 }).exec();
    if (!weeklyCapacity) {
      return res.status(400).json({ error: 'No weekly capacity set' });
    }

    const cart = await Cart.findOne({ userId });

    if (cart) {
      const currentQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      if (currentQuantity + quantity > weeklyCapacity.capacity) {
        return res.status(400).json({ error: 'Cannot add more than weekly capacity' });
      }

      const existingItem = cart.items.find(item => item.stockId.toString() === stockId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ stockId, quantity });
      }

      await cart.save();
    } else {
      if (quantity > weeklyCapacity.capacity) {
        return res.status(400).json({ error: 'Cannot add more than weekly capacity' });
      }

      const newCart = new Cart({
        userId,
        items: [{ stockId, quantity }],
      });

      await newCart.save();
    }

    res.status(200).json({ message: 'Item added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// controllers/cartController.js
const Cart = require('../models/Cart');
const Stock = require('../models/Stock');

exports.addToCart = async (req, res) => {
    try {
        const { itemName, quantity } = req.body;
        const user = req.user;

        if (!itemName || !quantity) {
            return res.status(400).json({ error: 'Item name and quantity are required' });
        }

        // Find the most recent stock for the given item name
        const latestStock = await Stock.findOne({ item: itemName }).sort({ createdAt: -1 }).exec();

        if (!latestStock) {
            return res.status(404).json({ error: 'Stock item not found' });
        }

        // Check if the quantity requested exceeds the stock quantity
        if (quantity > latestStock.quantity) {
            return res.status(400).json({ error: 'Requested quantity exceeds available stock' });
        }

        // Find or create a cart for the user
        let cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            cart = new Cart({ user: user._id });
        }

        // Check if the item already exists in the cart
        const existingItemIndex = cart.items.findIndex(item => item.item.equals(latestStock._id));
        if (existingItemIndex >= 0) {
            // Update the quantity if the item already exists
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item to the cart
            cart.items.push({
                item: latestStock._id,
                quantity,
                pricePerCarton: latestStock.pricePerCarton
            });
        }

        // Update the cart total
        cart.total = cart.items.reduce((sum, item) => sum + (item.quantity * item.pricePerCarton), 0);

        await cart.save();

        res.status(200).json({ message: 'Item added to cart successfully', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;
        const user = req.user;

        // Check for the presence of both itemId and quantity
        if (!itemId || quantity === undefined) {
            return res.status(400).json({ error: 'Item ID and quantity are required' });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Find the item in the cart
        const itemIndex = cart.items.findIndex(item => item.item.equals(itemId));
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        // Find the latest stock for the item
        const latestStock = await Stock.findById(itemId);
        if (!latestStock) {
            return res.status(404).json({ error: 'Stock item not found' });
        }

        // Check if the quantity requested exceeds the stock quantity
        if (quantity > latestStock.quantity) {
            return res.status(400).json({ error: 'Requested quantity exceeds available stock' });
        }

        // Update the item quantity
        cart.items[itemIndex].quantity = quantity;

        // Update the cart total
        cart.total = cart.items.reduce((sum, item) => sum + (item.quantity * item.pricePerCarton), 0);

        await cart.save();

        res.status(200).json({ message: 'Cart item updated successfully', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteCartItem = async (req, res) => {
    try {
        const { itemId } = req.body;
        const user = req.user;

        if (!itemId) {
            return res.status(400).json({ error: 'Item ID is required' });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Find and remove the item from the cart
        const initialItemCount = cart.items.length;
        cart.items = cart.items.filter(item => !item.item.equals(itemId));

        // Check if any item was removed
        if (cart.items.length === initialItemCount) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        // Update the cart total
        cart.total = cart.items.reduce((sum, item) => sum + (item.quantity * item.pricePerCarton), 0);

        await cart.save();

        res.status(200).json({ message: 'Cart item deleted successfully', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



const Cart = require('../models/Cart');
const Stock = require('../models/Stock');

exports.addToCart = async (req, res) => {
    try {
        const { itemName, quantity } = req.body;
        const user = req.user;

        if (!itemName || !quantity) {
            return res.status(400).json({ error: 'Item name and quantity are required' });
        }

        const latestStock = await Stock.findOne({ item: itemName }).sort({ createdAt: -1 }).exec();

        if (!latestStock) {
            return res.status(404).json({ error: 'Stock item not found' });
        }

        if (quantity > latestStock.quantity) {
            return res.status(400).json({ error: 'Requested quantity exceeds available stock' });
        }

        let cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            cart = new Cart({ user: user._id });
        }

        const existingItemIndex = cart.items.findIndex(item => item.item.equals(latestStock._id));
        if (existingItemIndex >= 0) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                item: latestStock._id,
                quantity,
                pricePerCarton: latestStock.pricePerCarton
            });
        }

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

        if (!itemId || quantity === undefined) {
            return res.status(400).json({ error: 'Item ID and quantity are required' });
        }

        const cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.item.equals(itemId));
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        const latestStock = await Stock.findById(itemId);
        if (!latestStock) {
            return res.status(404).json({ error: 'Stock item not found' });
        }

        if (quantity > latestStock.quantity) {
            return res.status(400).json({ error: 'Requested quantity exceeds available stock' });
        }

        cart.items[itemIndex].quantity = quantity;

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

        const cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const initialItemCount = cart.items.length;
        cart.items = cart.items.filter(item => !item.item.equals(itemId));

        if (cart.items.length === initialItemCount) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        cart.total = cart.items.reduce((sum, item) => sum + (item.quantity * item.pricePerCarton), 0);

        await cart.save();

        res.status(200).json({ message: 'Cart item deleted successfully', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// controllers/checkoutController.js
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Stock = require('../models/Stock');
const flutterwave = require('flutterwave-node-v3'); // Install this package and configure it

const flw = new flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);

exports.checkout = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId }).populate('items.stockId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const totalCost = cart.items.reduce((sum, item) => sum + item.quantity * item.stockId.pricePerCarton, 0);

    const paymentDetails = {
      tx_ref: `order-${Date.now()}`,
      amount: totalCost,
      currency: 'NGN',
      redirect_url: 'http://localhost:3000/payment-callback',
      customer: {
        email: req.user.email,
        phonenumber: req.user.phoneNumber,
        name: req.user.name,
      },
      customizations: {
        title: 'My Store Payment',
        description: 'Payment for items in cart',
      },
    };

    const response = await flw.Payment.initiate(paymentDetails);

    if (response.status === 'success') {
      const order = new Order({
        userId,
        items: cart.items.map(item => ({
          stockId: item.stockId._id,
          quantity: item.quantity,
          price: item.stockId.pricePerCarton,
        })),
        totalCost,
      });

      await order.save();

      // Clear the cart
      await Cart.findOneAndDelete({ userId });

      res.status(200).json({
        message: 'Order placed successfully',
        order,
        paymentLink: response.data.link,
      });
    } else {
      res.status(400).json({ error: 'Payment initiation failed' });
    }
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

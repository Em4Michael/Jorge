// controllers/checkoutController.js
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Fee = require('../models/Fee');

exports.checkout = async (req, res) => {
    try {
        const user = req.user; // Assuming the user is authenticated and req.user contains user details
        const { paymentMethod, currency, cardDetails, transferDetails, deliveryAddressId } = req.body;

        // Fetch the user's cart
        const cart = await Cart.findOne({ user: user._id }).populate('items.item');
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Fetch user details
        const userDetail = await User.findById(user._id);
        if (!userDetail) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Determine delivery address
        let deliveryAddress;
        if (deliveryAddressId) {
            // Use provided delivery address ID
            const address = userDetail.deliveryAddresses.id(deliveryAddressId);
            if (address) {
                deliveryAddress = address.address;
            } else {
                return res.status(404).json({ error: 'Delivery address not found' });
            }
        } else {
            // Use the most recent active delivery address
            const activeAddress = userDetail.deliveryAddresses.find(addr => addr.isActive);
            if (activeAddress) {
                deliveryAddress = activeAddress.address;
            } else {
                return res.status(400).json({ error: 'No active delivery address found' });
            }
        }

        // Fetch the most recent fee
        const fee = await Fee.findOne().sort({ _id: -1 });
        if (!fee) {
            return res.status(404).json({ error: 'Fee not found' });
        }

        const { deliveryFee, taxRate } = fee;
        const subtotal = cart.total;
        const total = subtotal + deliveryFee + (subtotal * taxRate); // Calculate the final total amount

        let paymentPayload = {};
        let response = {};

        // Handle card payment
        if (paymentMethod === 'card') {
            paymentPayload = {
                card_number: cardDetails.card_number,
                cvv: cardDetails.cvv,
                expiry_month: cardDetails.expiry_month,
                expiry_year: cardDetails.expiry_year,
                currency: currency || 'NGN',
                amount: total, // Use the calculated total amount
                fullname: userDetail.name,
                phone_number: userDetail.phoneNumber,
                email: userDetail.email,
                tx_ref: `tx-${Date.now()}`,
                redirect_url: 'http://your-redirect-url.com',
                enckey: process.env.FLUTTERWAVE_ENCRYPTION_KEY, // Ensure this key is set in your environment variables
            };

            response = await flw.Charge.card(paymentPayload);
        }
        // Handle transfer payment
        else if (paymentMethod === 'transfer') {
            paymentPayload = {
                amount: total,
                currency: currency || 'NGN',
                account_bank: transferDetails.account_bank,
                account_number: transferDetails.account_number
            };
        
            response = await flw.Transfer.initiate(paymentPayload);
        }
        
         else {
            return res.status(400).json({ error: 'Invalid payment method' });
        }

        if (response.status === 'success') {
            const newOrder = new Order({
                user: user._id,
                items: cart.items,
                total: total,
                address: deliveryAddress, // Make sure this field is provided
                paymentMethod: paymentMethod, // Save the payment method used
                status: 'paid'
            });

            await newOrder.save();

            // Update stock quantities
            for (const cartItem of cart.items) {
                const stockItem = await Stock.findById(cartItem.item._id);
                if (stockItem) {
                    stockItem.quantity -= cartItem.quantity;
                    await stockItem.save();
                }
            }

            // Clear the user's cart
            await Cart.findByIdAndDelete(cart._id);

            return res.status(200).json({ message: 'Payment processed successfully', data: response });
        } else {
            return res.status(400).json({ error: 'Payment failed', data: response });
        }
    } catch (error) {
        console.error('Error processing checkout:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

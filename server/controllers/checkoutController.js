const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Fee = require('../models/Fee');

exports.checkout = async (req, res) => {
    try {
        const user = req.user; 
        const { paymentMethod, currency, cardDetails, transferDetails, deliveryAddressId } = req.body;

        const cart = await Cart.findOne({ user: user._id }).populate('items.item');
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const userDetail = await User.findById(user._id);
        if (!userDetail) {
            return res.status(404).json({ error: 'User not found' });
        }

        let deliveryAddress;
        if (deliveryAddressId) {
            const address = userDetail.deliveryAddresses.id(deliveryAddressId);
            if (address) {
                deliveryAddress = address.address;
            } else {
                return res.status(404).json({ error: 'Delivery address not found' });
            }
        } else {
            const activeAddress = userDetail.deliveryAddresses.find(addr => addr.isActive);
            if (activeAddress) {
                deliveryAddress = activeAddress.address;
            } else {
                return res.status(400).json({ error: 'No active delivery address found' });
            }
        }

        const fee = await Fee.findOne().sort({ _id: -1 });
        if (!fee) {
            return res.status(404).json({ error: 'Fee not found' });
        }

        const { deliveryFee, taxRate } = fee;
        const subtotal = cart.total;
        const total = subtotal + deliveryFee + (subtotal * taxRate); 

        let paymentPayload = {};
        let response = {};

        if (paymentMethod === 'card') {
            paymentPayload = {
                card_number: cardDetails.card_number,
                cvv: cardDetails.cvv,
                expiry_month: cardDetails.expiry_month,
                expiry_year: cardDetails.expiry_year,
                currency: currency || 'NGN',
                amount: total, 
                fullname: userDetail.name,
                phone_number: userDetail.phoneNumber,
                email: userDetail.email,
                tx_ref: `tx-${Date.now()}`,
                redirect_url: 'http://your-redirect-url.com',
                enckey: process.env.FLUTTERWAVE_ENCRYPTION_KEY,
            };

            response = await flw.Charge.card(paymentPayload);
        }
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
                address: deliveryAddress, 
                paymentMethod: paymentMethod, 
                status: 'paid'
            });

            await newOrder.save();

            for (const cartItem of cart.items) {
                const stockItem = await Stock.findById(cartItem.item._id);
                if (stockItem) {
                    stockItem.quantity -= cartItem.quantity;
                    await stockItem.save();
                }
            }

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

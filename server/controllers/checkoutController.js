// controllers/checkoutController.js

const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Fee = require('../models/Fee');
const { generateSalesReportData } = require('./salesReportController'); // Import generateSalesReportData directly
const SalesReport = require('../models/SalesReport');

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

        const fee = await Fee.findOne().sort({ createdAt: -1 }); // Sort by createdAt in descending order to get the most recent fee
        if (!fee) {
            return res.status(404).json({ error: 'Fee not found' });
        }

        const { deliveryFee, taxRate } = fee;
        const subtotal = cart.total;
        const taxAmount = subtotal * taxRate; // Calculate the tax amount based on a percentage
        const total = subtotal + deliveryFee + taxAmount; // Add delivery fee and tax amount to the subtotal
        

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
        } else if (paymentMethod === 'transfer') {
            paymentPayload = {
                amount: total,
                currency: currency || 'NGN',
                account_bank: transferDetails.account_bank,
                account_number: transferDetails.account_number
            };

            response = await flw.Transfer.initiate(paymentPayload);
        } else {
            return res.status(400).json({ error: 'Invalid payment method' });
        }

        if (response.status === 'success') {
            const newOrder = new Order({
                user: user._id,
                items: cart.items,
                total: total,
                address: deliveryAddress,
                paymentMethod: paymentMethod,
                status: 'paid',
                deliveryStatus: 'pending' 
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


            // Generate the sales report directly within this function
            try {
                const newReportData = await generateSalesReportData();

                // Fetch the last saved sales report from the database
                const lastReport = await SalesReport.findOne().sort({ createdAt: -1 });

                // Check if there's any change between the new report and the last saved report
                const hasChanges = !lastReport || JSON.stringify(newReportData) !== JSON.stringify(lastReport.toObject());

                if (hasChanges) {
                    // Create a new sales report document and save it
                    const newSalesReport = new SalesReport(newReportData);
                    await newSalesReport.save();
                }
            } catch (err) {
                console.error('Error generating sales report:', err);
                // Handle report generation error if needed
            }

            return res.status(200).json({ message: 'Payment processed successfully', data: response });
        } else {
            return res.status(400).json({ error: 'Payment failed', data: response });
        }
    } catch (error) {
        console.error('Error processing checkout:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
      const { orderId, status, deliveryStatus } = req.body;
      const user = req.user;
  
      // Valid statuses from the schema
      const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'canceled'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      if (deliveryStatus && !validStatuses.includes(deliveryStatus)) {
        return res.status(400).json({ error: 'Invalid delivery status value' });
      }
  
      // Find the order
      const order = await Order.findById(orderId).populate('user');
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      // Check permissions: only superadmin or order owner can update
      if (user._id.toString() !== order.user._id.toString() && user.role !== 'superadmin') {
        return res.status(403).json({ error: 'Access denied' });
      }
  
      // Update statuses if provided
      if (status) order.status = status;
      if (deliveryStatus) order.deliveryStatus = deliveryStatus;
  
      await order.save();
  
      // Optionally regenerate sales report if status changes affect it (e.g., from paid to canceled)
      if (status && (status === 'canceled' || order.status === 'paid')) {
        const newReportData = await generateSalesReportData();
        const lastReport = await SalesReport.findOne().sort({ createdAt: -1 });
        const hasChanges = !lastReport || JSON.stringify(newReportData) !== JSON.stringify(lastReport.toObject());
  
        if (hasChanges) {
          const newSalesReport = new SalesReport(newReportData);
          await newSalesReport.save();
        }
      }
  
      res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
 // controllers/checkoutController.js (add this function)
exports.getOrders = async (req, res) => {
    try {
      const user = req.user;
      let orders;
      if (user.role === 'superadmin') {
        orders = await Order.find().populate('user', 'name');
      } else {
        orders = await Order.find({ user: user._id }).populate('user', 'name');
      }
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
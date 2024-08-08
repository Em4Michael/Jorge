// controllers/orderController.js
const mongoose = require('mongoose');
const UserOrder = require('../models/Order');
const Stock = require('../models/Stock');
const WeeklyCapacity = require('../models/WeeklyCapacity');
const { processPayment } = require('./checkoutController');

const getMostRecentWeeklyCapacity = async () => {
  return await WeeklyCapacity.findOne().sort({ startDate: -1 }).exec();
};

exports.placeOrder = async (req, res) => {
  try {
    const { userId, quantity, paymentMethod, amount, currency } = req.body;

    if (!userId || quantity == null) {
      return res.status(400).json({ error: 'User ID and quantity are required' });
    }

    const recentCapacity = await getMostRecentWeeklyCapacity();

    if (!recentCapacity) {
      return res.status(400).json({ error: 'No weekly capacity set' });
    }

    const totalTomatoesForWeek = await UserOrder.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          orderDate: { $gte: recentCapacity.startDate }, // Orders from this week
        },
      },
      {
        $group: {
          _id: null,
          totalOrdered: { $sum: '$tomatoesOrdered' },
        },
      },
    ]);

    const totalOrdered = totalTomatoesForWeek[0]?.totalOrdered || 0;

    if (totalOrdered + quantity > recentCapacity.capacity) {
      return res.status(400).json({ error: 'Order exceeds weekly capacity' });
    }

    const stock = await Stock.findOne({ item: 'tomatoes' });
    if (!stock || stock.quantity < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    // Process payment
    const paymentResponse = await processPayment({
      body: { userId, paymentMethod, amount, currency, ...req.body },
    }, res);

    if (paymentResponse.status !== 200) {
      return res.status(paymentResponse.status).json(paymentResponse.data);
    }

    // Save order to the database
    const newOrder = new UserOrder({ userId, tomatoesOrdered: quantity, weekNumber: new Date().getWeekNumber() });
    await newOrder.save();

    // Update stock
    stock.quantity -= quantity;
    await stock.save();

    res.status(200).json({ message: 'Order placed and payment processed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

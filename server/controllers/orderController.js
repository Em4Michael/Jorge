const UserOrder = require('../models/UserOrder');
const { processPayment } = require('./checkoutController'); // Import processPayment method

const MAX_WEEKLY_CAPACITY = parseInt(process.env.MAX_WEEKLY_CAPACITY, 10) || 1000;

const getTotalTomatoesForWeek = async (userId) => {
    return 0; // Replace with the actual logic to get the total tomatoes ordered for the week
};

exports.placeOrder = async (req, res) => {
    try {
        const { userId, quantity, paymentMethod, amount, currency } = req.body;

        if (!userId || quantity == null) {
            return res.status(400).json({ error: 'User ID and quantity are required' });
        }

        const totalTomatoes = await getTotalTomatoesForWeek(userId);

        if (totalTomatoes + quantity > MAX_WEEKLY_CAPACITY) {
            return res.status(400).json({ error: 'Order exceeds weekly capacity' });
        }

        // Process payment before placing the order
        const paymentResponse = await processPayment({
            body: { userId, marketId: 1, paymentMethod, amount, currency, card_number: '1234567812345678', cvv: '123', expiry_month: '09', expiry_year: '23', fullname: 'John Doe', email: 'johndoe@example.com' }
        }, res);

        if (paymentResponse.status !== 200) {
            return res.status(paymentResponse.status).json(paymentResponse.data);
        }

        // Save order to the database
        // const newOrder = new UserOrder({ userId, tomatoesOrdered: quantity, weekNumber: new Date().getWeekNumber() });
        // await newOrder.save();

        res.status(200).json({ message: 'Order placed and payment processed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const stockRoutes = require('./routes/stockRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const otpRoutes = require('./routes/otpRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Middleware
app.use(express.json());

// API Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', orderRoutes);
app.use('/api', stockRoutes);
app.use('/api', checkoutRoutes);
app.use('/api', otpRoutes); 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const stockRoutes = require('./routes/stockRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const otpRoutes = require('./routes/otpRoutes');
const capacityRoutes = require('./routes/capacityRoutes');

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
app.use('/api', stockRoutes);
app.use('/api', cartRoutes);
app.use('/api', checkoutRoutes);
app.use('/api', otpRoutes); 
app.use('/api', capacityRoutes); 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

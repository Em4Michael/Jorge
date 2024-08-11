const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const stockRoutes = require('./routes/stockRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const otpRoutes = require('./routes/otpRoutes');
const feeRoutes = require('./routes/feeRoutes'); 
const plantReportRoutes = require('./routes/plantReportRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const createWebSocketServer = require('./websocket/websocketServer');



require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000; 
connectDB();

app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', stockRoutes);
app.use('/api', cartRoutes);
app.use('/api', checkoutRoutes); 
app.use('/api', feeRoutes); 
app.use('/api', otpRoutes);  
app.use('/api', plantReportRoutes);
app.use('/api/devices', deviceRoutes); // New device routes



const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

createWebSocketServer(server);
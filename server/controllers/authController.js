// controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const otpStore = require('../utils/otpStore'); // Utility for managing OTPs


const signup = async (req, res) => {
  const { name, phoneNumber, email, password } = req.body;

  try {
    // Check if the phone number is verified
    if (!otpStore.isVerified(phoneNumber)) {
      return res.status(400).json({ error: 'Phone number not verified' });
    }

    // Check if the user already exists
    let user = await User.findOne({ phoneNumber });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with the default role
    user = new User({
      name,
      phoneNumber,
      email: email || null,
      password: hashedPassword,
      role: 'user', // Default role
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  
    res.json({ 
      token,
      role: user.role,
      userId: user._id,
    }); 
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { signup, login };

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const otpStore = require('../utils/otpStore'); 
const { sendOtp } = require('./otpController'); 

const signup = async (req, res) => {
  const { name, phoneNumber, email, password } = req.body;

  try {
    if (!otpStore.isVerified(phoneNumber)) {
      return res.status(400).json({ error: 'Phone number not verified' });
    }

   
    let user = await User.findOne({ phoneNumber });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ 
      name, 
      phoneNumber,
      email: email || null,
      password: hashedPassword,
      role: 'user', 
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


const requestPasswordReset = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await sendOtp(req, res);
  } catch (err) {
    console.error('Error requesting password reset:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { phoneNumber, otp, newPassword, confirmPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const isOtpVerified = otpStore.isVerified(phoneNumber);
    if (!isOtpVerified) {
      return res.status(400).json({ error: 'OTP not verified or invalid' });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    otpStore.clearOtp(phoneNumber);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { signup, login, requestPasswordReset, resetPassword };

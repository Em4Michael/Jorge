const express = require('express');
const { sendOtp, verifyOtp } = require('../controllers/otpController');

const router = express.Router();

router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);

module.exports = router;

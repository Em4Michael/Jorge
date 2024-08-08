// controllers/otpController.js
const { Vonage } = require('@vonage/server-sdk');
const otpStore = require('../utils/otpStore');
const formatPhoneNumber = require('../utils/formatPhoneNumber');
const crypto = require('crypto');

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

const sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const formattedPhoneNumber = formatPhoneNumber(phoneNumber, '234'); // Assuming '234' is the default country code

  const otp = crypto.randomInt(100000, 999999).toString();

  try {
    // Use Promises with Vonage API to handle responses
    vonage.sms
      .send({
        to: formattedPhoneNumber,
        from: 'Vonage',
        text: `Your OTP code is ${otp}`,
      })
      .then((responseData) => {
        if (responseData.messages[0].status === '0') {
          // Store OTP with phoneNumber as key
          otpStore.storeOtp(phoneNumber, otp);
          return res.json({ message: 'OTP sent successfully' });
        } else {
          console.error(
            `Failed to send OTP: ${responseData.messages[0]['error-text']}`
          );
          return res
            .status(500)
            .json({ error: responseData.messages[0]['error-text'] });
        }
      })
      .catch((err) => {
        console.error('Error sending OTP:', err);
        return res.status(500).json({ error: 'Failed to send OTP' });
      });
  } catch (err) {
    console.error('Error in sending OTP:', err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};

const verifyOtp = (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res
      .status(400)
      .json({ error: 'Phone number and OTP are required' });
  }

  const storedOtp = otpStore.getOtp(phoneNumber);

  if (storedOtp === otp) {
    otpStore.markAsVerified(phoneNumber); // Mark the OTP as verified
    return res.json({ message: 'OTP verified successfully' });
  } else {
    return res.status(400).json({ error: 'Invalid OTP' });
  }
};

module.exports = { sendOtp, verifyOtp };

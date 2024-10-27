const { Vonage } = require('@vonage/server-sdk');
const otpStore = require('../utils/otpStore');
const formatPhoneNumber = require('../utils/formatPhoneNumber');
const crypto = require('crypto');

// const vonage = new Vonage({
//   apiKey: process.env.VONAGE_API_KEY,
//   apiSecret: process.env.VONAGE_API_SECRET,
// });

const sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const formattedPhoneNumber = formatPhoneNumber(phoneNumber, '234'); 

  // Generate a fixed OTP
  const otp = '123456';

  try {
    // Comment out the Vonage API call
    /*
    vonage.sms
      .send({
        to: formattedPhoneNumber,
        from: 'Vonage',
        text: `Your OTP code is ${otp}`,
      })
      .then((responseData) => {
        if (responseData.messages[0].status === '0') {
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
    */

    // Directly store the OTP and respond
    otpStore.storeOtp(phoneNumber, otp);
    return res.json({ message: 'OTP sent successfully' });

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

  console.log('Stored OTP:', storedOtp);
  console.log('Provided OTP:', otp);

  if (storedOtp === otp) {
    otpStore.markAsVerified(phoneNumber); 
    return res.json({ message: 'OTP verified successfully' });
  } else {
    return res.status(400).json({ error: 'Invalid OTP' });
  }
};


module.exports = { sendOtp, verifyOtp };

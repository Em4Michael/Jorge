const axios = require('axios');
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY);

const availableMarkets = [
    { id: 1, name: 'Market A', location: 'Location A' },
    { id: 2, name: 'Market B', location: 'Location B' },
    // Add more markets as needed
];

// Get nearest markets
exports.getMarkets = (req, res) => {
    res.status(200).json(availableMarkets);
};

// Process payment
exports.processPayment = async (req, res) => {
    const { 
      userId, 
      marketId, 
      paymentMethod, 
      amount, 
      currency, 
      phoneNumber, 
      email, 
      card_number, 
      cvv, 
      expiry_month, 
      expiry_year, 
      fullname, 
      account_bank, 
      account_number 
    } = req.body;

    if (!['transfer', 'card'].includes(paymentMethod)) {
        return res.status(400).json({ error: 'Invalid payment method' });
    }

    try {
        if (paymentMethod === 'card') {
            // Card payment using Flutterwave
            const payload = {
              card_number,
              cvv,
              expiry_month,
              expiry_year,
              currency: currency || 'NGN',
              amount,
              fullname,
              phone_number: phoneNumber,
              email: email,
              tx_ref: `tx-${Date.now()}`,
              redirect_url: 'http://your-redirect-url.com',
              enckey: process.env.FLUTTERWAVE_ENCRYPTION_KEY,
            };

            const response = await flw.Charge.card(payload);
            if (response.status === 'success') {
                return res.status(200).json({ message: 'Payment processed successfully', data: response });
            } else {
                return res.status(400).json({ error: 'Payment failed', data: response });
            }
          } else if (paymentMethod === 'transfer') {
            const payload = {
              account_bank, // Bank code (e.g., '044' for Access Bank)
              account_number, // Recipient's account number
              amount,
              currency: currency || 'NGN',
              narration: 'Payment for order', // Reason for transfer
              reference: `ref-${Date.now()}`, // Unique reference for the transaction
              debit_currency: currency || 'NGN'
            };

            const response = await flw.Transfer.initiate(payload);
            if (response.status === 'success') {
                return res.status(200).json({ message: 'Transfer initiated successfully', data: response });
            } else {
                return res.status(400).json({ error: 'Transfer initiation failed', data: response });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
 
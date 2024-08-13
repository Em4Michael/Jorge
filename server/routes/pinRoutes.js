const express = require('express');
const router = express.Router();
const { updatePinState } = require('../controllers/pinController');

router.post('/toggle', async (req, res) => {
  try {
    const { pinName, state } = req.body;
    const updatedPinState = await updatePinState(pinName, state);

    // Send response with pin name and state
    res.status(200).json({ pinName: updatedPinState.pinName, state: updatedPinState.state });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
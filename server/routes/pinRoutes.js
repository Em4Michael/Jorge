const express = require('express');
const router = express.Router();
const { updatePinState, getPinState } = require('../controllers/pinController');

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

router.get('/pin-state/:pinName', async (req, res) => {
  try {
    const pinState = await getPinState(req.params.pinName);
    if (!pinState) {
      return res.status(200).json({ pinName: req.params.pinName, state: 'off' }); // Default to 'off' if not found
    }
    res.status(200).json(pinState);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
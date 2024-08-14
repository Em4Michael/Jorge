const PinState = require('../models/PinState');

const getPinState = async (pinName) => {
  try {
    const pinState = await PinState.findOne({ pinName: pinName });
    if (!pinState) {
      console.log(`No state found for pin: ${pinName}`);
    }
    return pinState;
  } catch (error) {
    console.error('Error fetching pin state:', error.message);
    throw error;
  }
};

const updatePinState = async (pinName, state) => {
  try {
    let pinState = await PinState.findOne({ pinName: pinName });

    if (!pinState) {
      pinState = new PinState({
        pinName: pinName,
        state: state,
        timestamp: new Date(),
      });
    } else {
      pinState.state = state;
      pinState.timestamp = new Date();
    }
 
    await pinState.save(); 

   // console.log(`Updating pin ${pinName} to state: ${state}`);
    return pinState;
  } catch (error) {
    console.error('Error updating pin state:', error.message);
    throw error;
  }
};

module.exports = {
  getPinState,
  updatePinState,
};

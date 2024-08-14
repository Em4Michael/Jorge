const WebSocket = require('ws');
const { saveSensorData } = require('../controllers/sensorDataController');
const { getPinState, updatePinState } = require('../controllers/pinController');
const PinState = require('../models/PinState'); // Import the PinState model

const createWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', async (socket) => {
    console.log('WebSocket connection established');

    try {
      // Send current pin states to the new client
      const allPinStates = await getAllPinStates();
      allPinStates.forEach((pinState) => {
        socket.send(JSON.stringify({ pinName: pinState.pinName, state: pinState.state }));
      });
    } catch (error) {
      console.error('Error sending pin states to new client:', error.message);
    }

    socket.on('message', async (message) => {
      try {
          const messageString = Buffer.isBuffer(message) ? message.toString('utf-8') : message;
  
          // Ensure the message is a non-empty string
          if (!messageString || typeof messageString !== 'string') {
              console.error('Received an invalid message format');
              return;
          }
  
          try {
              const parsedData = JSON.parse(messageString);
  
              // Handle sensor data
              if (parsedData.Date && parsedData.Time) {
                 // console.log('Received sensor data:', parsedData);
  
                  // Save sensor data
                  const savedData = await saveSensorData(parsedData);
  
                  // Broadcast sensor data to all clients
                  wss.clients.forEach((client) => {
                      if (client.readyState === WebSocket.OPEN) {
                          client.send(JSON.stringify(parsedData));
                      }
                  });
              }
              // Handle toggle command
              else if (parsedData.type === 'toggle' && parsedData.pinName) {
                  const pinName = parsedData.pinName;
                  const newState = await togglePinState(pinName);
  
                  // Broadcast the updated pin state to all clients
                  wss.clients.forEach((client) => {
                      if (client.readyState === WebSocket.OPEN) {
                          client.send(JSON.stringify({ pinName, state: newState }));
                      }
                  });
              } else {
                  console.error('Unrecognized message format:', messageString);
              }
          } catch (jsonError) {
             // console.error('Invalid JSON received:', messageString);
          }
      } catch (error) {
          console.error('Error handling WebSocket message:', error.message);
      }
  });
  
  

    socket.on('error', (error) => {
      console.error('WebSocket error:', error.message);
    });

    socket.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  console.log('WebSocket server is ready');
};

const togglePinState = async (pinName) => {
  try {
    // Get the current state of the pin from the database
    const currentPinState = await getPinState(pinName);

    // Check if pin state was found in the database
    if (currentPinState) {
      // Toggle the pin state
      const newState = currentPinState.state === 'on' ? 'off' : 'on';

      // Update the pin state in the database and get the updated state
      const updatedPinState = await updatePinState(pinName, newState);

      // Return the resolved state value
      return updatedPinState.state;
    } else {
      // If no state was found, create a new entry in the database with the default state
      const newPinState = await PinState.create({ pinName: pinName, state: 'on' });
      return newPinState.state;
    }
  } catch (error) {
    console.error('Error toggling pin state:', error.message);
    throw error;
  }
};

const getAllPinStates = async () => {
  try {
    const allPinStates = await PinState.find({});
    return allPinStates;
  } catch (error) {
    console.error('Error fetching all pin states:', error.message);
    throw error;
  }
};

module.exports = createWebSocketServer;

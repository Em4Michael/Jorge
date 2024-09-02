const WebSocket = require('ws');
const { saveSensorData } = require('../controllers/sensorDataController');
const { getPinState, updatePinState } = require('../controllers/pinController');
const PinState = require('../models/PinState'); 
const createWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', async (socket) => {
    console.log('WebSocket connection established');
  
    try {
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
  
          if (!messageString || typeof messageString !== 'string') {
              console.error('Received an invalid message format');
              return;
          }
  
          try {
              const parsedData = JSON.parse(messageString);
  
              if (parsedData.Date && parsedData.Time) {
  
                  const savedData = await saveSensorData(parsedData);
  
                  wss.clients.forEach((client) => {
                      if (client.readyState === WebSocket.OPEN) {
                          client.send(JSON.stringify(parsedData));
                      }
                  });
              }
              else if (parsedData.type === 'toggle' && parsedData.pinName) {
                  const pinName = parsedData.pinName;
                  const newState = await togglePinState(pinName);
  
                  wss.clients.forEach((client) => {
                      if (client.readyState === WebSocket.OPEN) {
                          client.send(JSON.stringify({ pinName, state: newState }));
                      }
                  });
              } else {
                  console.error('Unrecognized message format:', messageString);
              }
          } catch (jsonError) {
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
    const currentPinState = await getPinState(pinName);

    if (currentPinState) {
      const newState = currentPinState.state === 'on' ? 'off' : 'on';

      const updatedPinState = await updatePinState(pinName, newState);

      return updatedPinState.state;
    } else {
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

const WebSocket = require('ws');
const { saveSensorData } = require('../controllers/sensorDataController');
const { getPinState, updatePinState } = require('../controllers/pinController');
const PinState = require('../models/PinState');
const { saveAttendanceData } = require('../controllers/attendanceController');

const createWebSocketServer = (server) => {  
  const wss = new WebSocket.Server({ server });

  wss.on('connection', async (socket) => {
    console.log('WebSocket connection established from client');

    try {
      const allPinStates = await getAllPinStates();
      console.log('Sending initial pin states:', allPinStates);
      allPinStates.forEach((pinState) => {
        socket.send(JSON.stringify({ pinName: pinState.pinName, state: pinState.state || 'off' }));
      });
    } catch (error) {
      console.error('Error sending initial pin states:', error.message);
    }

    socket.on('message', async (message) => {
      try {
        const messageString = Buffer.isBuffer(message) ? message.toString('utf-8') : message;
        if (!messageString || typeof messageString !== 'string') {
          console.error('Invalid message format received:', messageString);
          return;
        }
    
        const parsedData = JSON.parse(messageString);
        console.log('Parsed data:', parsedData);
    
        if (parsedData.Date && parsedData.Time) {
          const savedSensorData = await saveSensorData(parsedData);
          const { Access, Exist } = parsedData;
          if (
            !(
              (Access === null || Access === 'null' || Access === false || Access === 'false') &&
              (Exist === null || Exist === 'null' || Exist === false || Exist === 'false')
            )
          ) {
            const savedAttendanceData = await saveAttendanceData(parsedData);
            console.log('Successfully saved attendance data:', savedAttendanceData);
          } else {
            console.log('Skipping attendance save:', { Access, Exist });
          }
    
          // Broadcast only if data is valid
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              console.log('Broadcasting to client:', savedSensorData);
              client.send(JSON.stringify(savedSensorData));
            }
          });
        } else if (parsedData.type === 'toggle' && parsedData.pinName) {
          // Toggle logic unchanged
        } else {
          console.error('Unrecognized message format:', parsedData);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error.message, error.stack);
        // Optionally broadcast an error message to clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ error: 'Failed to process message', details: error.message }));
          }
        });
      }
    });

    socket.on('error', (error) => {
      console.error('WebSocket connection error:', error.message, error.stack);
    });

    socket.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  console.log('WebSocket server started on ws://192.168.0.3:5000');
};

const togglePinState = async (pinName) => {
  try {
    const currentPinState = await getPinState(pinName);
    const newState = currentPinState?.state === 'on' ? 'off' : 'on';
    const updatedPinState = await updatePinState(pinName, newState);
    return updatedPinState.state;
  } catch (error) {
    console.error('Error toggling pin state:', error.message, error.stack);
    throw error;
  }
};

const getAllPinStates = async () => {
  try {
    const allPinStates = await PinState.find({});
    return allPinStates;
  } catch (error) {
    console.error('Error fetching all pin states:', error.message, error.stack);
    throw error;
  }
};

module.exports = createWebSocketServer;
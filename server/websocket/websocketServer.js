const WebSocket = require('ws');
const { saveSensorData } = require('../controllers/sensorDataController');

const createWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (socket) => {
    console.log('WebSocket connection established');

    socket.on('message', async (message) => {
      console.log('Received message:', message.toString()); // Log raw message

      try {
        const messageString = message.toString();
        console.log('Converted message:', messageString); // Log converted string

        const sensorData = JSON.parse(messageString); // Parse JSON
        console.log('Parsed sensor data:', sensorData); // Log parsed JSON

        // Save sensor data
        const savedData = await saveSensorData(sensorData);
        console.log('Sensor data saved:', savedData);

        // Broadcast to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(sensorData));
          }
        });
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

module.exports = createWebSocketServer;
  
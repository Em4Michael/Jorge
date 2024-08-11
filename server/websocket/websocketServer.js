const WebSocket = require('ws');
const { saveSensorData } = require('../controllers/sensorDataController');

const createWebSocketServer = (server) => {
  // Create a WebSocket server instance attached to the provided HTTP server
  const wss = new WebSocket.Server({ server });

  // Listen for incoming WebSocket connections
  wss.on('connection', (socket) => {
    console.log('WebSocket connection established');

    // Listen for messages from the client
    socket.on('message', async (message) => {
      const messageString = message.toString();
      console.log('Received message:', messageString); // Log the raw message

      if (messageString.startsWith('toggle:')) {
        const pinName = messageString.substring(7);
        console.log(`Toggling ${pinName}`);

        // Broadcast the toggle message to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(`toggle:${pinName}`);
          }
        });
      } else {
        try {
          const sensorData = JSON.parse(messageString); // Parse the JSON data
          console.log('Parsed sensor data:', sensorData); // Log the parsed JSON data
          
          // Save the parsed sensor data
          const savedData = await saveSensorData(sensorData);
          console.log('Sensor data saved:', savedData);

          // Broadcast the sensor data to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(sensorData));
            }
          });
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      }
    });  
  }); 
 
  // Log when the WebSocket server is ready
  console.log('WebSocket server is ready');
};

module.exports = createWebSocketServer;
  
const WebSocket = require('ws');
const DeviceData = require('./models/DeviceData');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', async (message) => {
      console.log(`Received: ${message}`);

      try {
        const data = JSON.parse(message);
        // Save data to the database
        const newDeviceData = new DeviceData(data);
        await newDeviceData.save();
        
        // Broadcast the data to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('Failed to parse JSON', error);
      }
    });
  });
};

module.exports = setupWebSocket;

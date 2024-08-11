const SensorData = require('../models/SensorData');

exports.saveSensorData = async (data) => {
  try {
    // Create a timestamp from Date and Time fields
    const { Date: date, Time: time, ...otherData } = data;
    const timestamp = new Date(`${date} ${time}`);

    // Log the incoming sensor data and the generated timestamp
    console.log('Received Sensor Data:', { ...otherData, Date: date, Time: time, timestamp });

    const sensorData = new SensorData({ ...otherData, Date: date, Time: time, timestamp });
    const savedData = await sensorData.save();
    
    // Log the saved sensor data
    console.log('Saved Sensor Data:', savedData);

    return savedData;
  } catch (error) {
    throw new Error('Error saving sensor data: ' + error.message);
  }
};

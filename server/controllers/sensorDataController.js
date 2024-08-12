const SensorData = require('../models/SensorData');

exports.saveSensorData = async (data) => {
  try {
    const { Date: date, Time: time, ...otherData } = data;
    const timestamp = new Date(`${date} ${time}`);

    console.log('Received Sensor Data:', { ...otherData, Date: date, Time: time, timestamp });

    const sensorData = new SensorData({ ...otherData, Date: date, Time: time, timestamp });
    const savedData = await sensorData.save();

    console.log('Saved Sensor Data:', savedData);

    return savedData;
  } catch (error) {
    throw new Error('Error saving sensor data: ' + error.message);
  }
};

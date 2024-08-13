const SensorData = require('../models/SensorData');

exports.saveSensorData = async (data) => {
  try {
    const { Date: date, Time: time, ...otherData } = data;

    // Split the date string and reformat it to 'MM/DD/YYYY'
    const [day, month, year] = date.split('/');
    const formattedDate = `${month}/${day}/${year}`;

    // Create a valid timestamp using the formatted date and time
    const timestamp = new Date(`${formattedDate} ${time}`);

    if (isNaN(timestamp.getTime())) {
      throw new Error('Invalid date or time format');
    }

   // console.log('Received Sensor Data:', { ...otherData, Date: date, Time: time, timestamp });

    const sensorData = new SensorData({ ...otherData, Date: date, Time: time, timestamp });
    const savedData = await sensorData.save();

   // console.log('Saved Sensor Data:', savedData);

    return savedData;
  } catch (error) {
    throw new Error('Error saving sensor data: ' + error.message);
  }
};

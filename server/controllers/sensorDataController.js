// sensorDataController.js
const SensorData = require('../models/SensorData');

exports.saveSensorData = async (data) => {
  try {
    console.log('Attempting to save sensor data:', data);

    const { Date: dateStr, Time, RN, UV, MO, TP, HM, HI, Access, Exist } = data;

    // Handle date parsing
    const [day, month, year] = dateStr.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    const formattedDate = `${month}/${day}/${fullYear}`;
    console.log('Formatted date:', formattedDate);

    // Use global Date constructor explicitly
    const timestamp = new global.Date(`${formattedDate} ${Time}`);
    console.log('Generated timestamp:', timestamp);

    if (isNaN(timestamp.getTime())) {
      throw new Error(`Invalid date or time format: ${formattedDate} ${Time}`);
    }

    const sensorData = new SensorData({
      Date: dateStr,
      Time,
      RN: RN || 0,
      UV: UV || 0,
      MO: MO || 0,
      TP: TP || 0,
      HM: HM || 0,
      HI: HI || 0,
      Access: Access === 'null' ? null : Access,
      Exist: Exist === false ? 'false' : Exist || null,
      timestamp,
    });

    console.log('Sensor data object prepared for save:', sensorData);

    const savedData = await sensorData.save();
    console.log('Sensor data successfully saved to database:', savedData);

    return savedData;
  } catch (error) {
    console.error('Error saving sensor data to database:', error.message, error.stack);
    throw error;
  }
};
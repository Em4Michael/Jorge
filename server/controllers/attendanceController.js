const Attendance = require('../models/Attendance');

exports.saveAttendanceData = async (data) => {
  try {
    const { Date: date, Time: time, Access, Exist: exit } = data; // Rename Exist to exit

    console.log('Attempting to save attendance data:', { Date: date, Time: time, Access, Exit: exit });

    // Updated condition: Skip only if BOTH Access and Exit are invalid
    if (
      (Access === null || Access === 'null' || Access === false || Access === 'false') &&
      (exit === null || exit === 'null' || exit === false || exit === 'false')
    ) {
      console.log('Skipping attendance save because both Access and Exit are invalid:', { Access, Exit: exit });
      return null; // Return null to indicate no data was saved
    }

    const [day, month, year] = date.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    const formattedDate = `${month}/${day}/${fullYear}`;
    const timestamp = new global.Date(`${formattedDate} ${time}`);

    if (isNaN(timestamp.getTime())) {
      throw new Error('Invalid date or time format');
    }

    const attendanceData = new Attendance({
      Date: date,
      Time: time,
      Access,
      Exit: exit,
      timestamp,
    });

    const savedData = await attendanceData.save();
    console.log('Attendance data saved:', savedData);
    return savedData;
  } catch (error) {
    console.error('Error saving attendance data:', error.message, error.stack);
    throw error;
  }
};
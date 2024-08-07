// controllers/capacityController.js
const WeeklyCapacity = require('../models/WeeklyCapacity');
const adminMiddleware = require('../middlewares/adminMiddleware');


exports.updateCapacity = async (req, res) => {
  try {
    const { capacity } = req.body;

    if (!capacity) {
      return res.status(400).json({ error: 'Capacity is required' });
    }

    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 5)); // Calculate the start of the week as last Friday

    const weeklyCapacity = new WeeklyCapacity({
      capacity,
      startDate: startOfWeek,
    });

    await weeklyCapacity.save();

    res.status(200).json({ message: 'Weekly capacity updated', data: weeklyCapacity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMostRecentCapacity = async (req, res) => {
  try {
    const recentCapacity = await WeeklyCapacity.findOne().sort({ startDate: -1 }).exec();
    if (!recentCapacity) {
      return res.status(404).json({ error: 'No weekly capacity set' });
    }
    res.status(200).json(recentCapacity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

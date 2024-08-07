// middlewares/adminMiddleware.js
const User = require('../models/User'); // Assuming you have a User model

const adminMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming `req.user` is set by an authentication middleware
    const user = await User.findById(userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = adminMiddleware;

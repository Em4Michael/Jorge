const validateFields = require('../utils/validateFields');

const validateSignup = (req, res, next) => {
  const { name, phoneNumber, password, confirmPassword, email } = req.body;
  const errors = validateFields(name, phoneNumber, password, confirmPassword, email);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = validateSignup;

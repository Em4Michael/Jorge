// utils/validateFields.js

const validateFields = (name, phoneNumber, password, confirmPassword) => {
  const errors = {};

  if (!name || name.trim() === '') {
    errors.name = 'Name/Business Name is required';
  }

  if (!phoneNumber || phoneNumber.trim() === '') {
    errors.phoneNumber = 'Phone number is required';
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

module.exports = validateFields;

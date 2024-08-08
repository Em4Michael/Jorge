const express = require('express');
const { signup, login, requestPasswordReset, resetPassword } = require('../controllers/authController');
const validateSignup = require('../middlewares/validateSignup');

const router = express.Router();

router.post('/auth/signup', validateSignup, signup);
router.post('/auth/login', login);
router.post('/auth/request-password-reset', requestPasswordReset);
router.post('/auth/reset-password', resetPassword);

module.exports = router;

const express = require('express');
const { signup, login } = require('../controllers/authController');
const validateSignup = require('../middlewares/validateSignup');

const router = express.Router();

router.post('/auth/signup', validateSignup, signup);
router.post('/auth/login', login);

module.exports = router;

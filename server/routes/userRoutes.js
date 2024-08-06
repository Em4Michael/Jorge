const express = require('express');
const { getAllUsers, updateUserRole } = require('../controllers/userController');
const { authMiddleware, superAdminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route for getting all users, accessible only with authentication
router.get('/user/users', authMiddleware, getAllUsers);

// Route for updating a user's role, accessible only with super admin privileges
router.put('/user/users/role', authMiddleware, superAdminMiddleware, updateUserRole);

module.exports = router;

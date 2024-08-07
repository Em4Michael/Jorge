const express = require('express');
const { 
    createDeliveryAddress,
    updateDeliveryAddress,
    deleteDeliveryAddress,
    getAllDeliveryAddresses,
    getAllUsers,
    updateUserRole, 
} = require('../controllers/userController');

const { authMiddleware, superAdminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route for getting all users, accessible only with authentication
router.post('/address', authMiddleware, createDeliveryAddress);
router.put('/address', authMiddleware, updateDeliveryAddress);
router.delete('/address', authMiddleware, deleteDeliveryAddress);
router.get('/addresses/:userId', authMiddleware, getAllDeliveryAddresses);
router.get('/users', authMiddleware, superAdminMiddleware, getAllUsers);
router.put('/user/users/role', authMiddleware, superAdminMiddleware, updateUserRole);

module.exports = router;

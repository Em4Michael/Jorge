const express = require('express');
const { 
    createDeliveryAddress,
    updateDeliveryAddress,
    deleteDeliveryAddress,
    getAllDeliveryAddresses,
    getAllUsers,
    updateUserRole, 
    updateUserEmail,
    getUserDetails,
} = require('../controllers/userController');

const { authMiddleware, superAdminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/address', authMiddleware, createDeliveryAddress);
router.put('/address', authMiddleware, updateDeliveryAddress);
router.delete('/address', authMiddleware, deleteDeliveryAddress);
router.get('/addresses/:userId', authMiddleware, getAllDeliveryAddresses);
router.get('/users', authMiddleware, superAdminMiddleware, getAllUsers);
router.put('/user/users/role', authMiddleware, superAdminMiddleware, updateUserRole);
router.put('/user/email', authMiddleware, updateUserEmail);
router.get('/user-details/:userId', authMiddleware, getUserDetails);


module.exports = router; 
  
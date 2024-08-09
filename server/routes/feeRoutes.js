const express = require('express');
const {
  createFee,
  getRecentFee,
  updateRecentFee,
  getAllFees,
  getFeeById
} = require('../controllers/feeController');
const { authMiddleware, superAdminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/fee', authMiddleware, superAdminMiddleware, createFee);
router.get('/fee/recent', authMiddleware, getRecentFee);
router.put('/fee/recent', authMiddleware, superAdminMiddleware, updateRecentFee);
router.get('/fees', authMiddleware, getAllFees);
router.get('/fee/:id', authMiddleware, getFeeById);

module.exports = router;

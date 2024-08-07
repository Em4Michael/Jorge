const express = require('express');
const {
  getStockAvailability,
  createStock,
  updateStock,
  deleteStock,
  getAllStock,
  getStockById,
} = require('../controllers/stockController');
const { authMiddleware, superAdminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/stock/availability', getStockAvailability);
router.post('/stock', authMiddleware, superAdminMiddleware, createStock);
router.put('/stock/:id', authMiddleware, superAdminMiddleware, updateStock);
router.delete('/stock/:id', authMiddleware, superAdminMiddleware, deleteStock);
router.get('/stock', getAllStock);
router.get('/stock/:id', getStockById);

module.exports = router;

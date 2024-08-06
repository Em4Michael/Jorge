const express = require('express');
const { getStockAvailability } = require('../controllers/stockController');

const router = express.Router();

router.get('/stock/availability', getStockAvailability);

module.exports = router;

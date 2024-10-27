// routes/salesReportRoutes.js

const express = require('express');
const router = express.Router();
const { generateSalesReport, getSalesReports } = require('../controllers/salesReportController');

router.post('/sales-reports/generate', generateSalesReport);
router.get('/sales-reports', getSalesReports);

module.exports = router;

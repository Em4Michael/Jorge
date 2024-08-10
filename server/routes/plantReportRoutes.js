const express = require('express');
const { logProductivity, reportHealthStatus, getPlantReports } = require('../controllers/plantReportController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/plant-report/productivity', authMiddleware, adminMiddleware, logProductivity);
router.post('/plant-report/health', authMiddleware, adminMiddleware, reportHealthStatus);
router.get('/plant-report', authMiddleware, adminMiddleware, getPlantReports);

module.exports = router;

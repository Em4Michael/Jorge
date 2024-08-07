const express = require('express');
const { updateCapacity, getMostRecentCapacity } = require('../controllers/capacityController');
const { authMiddleware, superAdminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/update', authMiddleware, superAdminMiddleware, updateCapacity); // Apply adminMiddleware here
router.get('/most-recent', getMostRecentCapacity);

module.exports = router;

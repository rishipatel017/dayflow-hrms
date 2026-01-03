const express = require('express');
const router = express.Router();
const seedController = require('../controllers/seedController');

router.post('/attendance', seedController.seedAttendance);
router.post('/leaves', seedController.seedLeaves);

module.exports = router;

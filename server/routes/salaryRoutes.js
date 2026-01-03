const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');

router.get('/user/:userId', salaryController.getSalaryByUserId);
router.put('/', salaryController.updateSalary);

module.exports = router;

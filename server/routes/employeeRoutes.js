const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

const upload = require('../middleware/upload');

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeController.createEmployee);
router.put('/:id', upload.single('profilePicture'), employeeController.updateProfile);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;

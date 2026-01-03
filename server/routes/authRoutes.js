const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const upload = require('../middleware/upload');

router.post('/login', authController.login);
router.post('/signup', upload.single('profilePicture'), authController.signup);
router.post('/reset-password', authController.resetPassword);

module.exports = router;

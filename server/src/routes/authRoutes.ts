import { Router } from 'express';
import * as authController from '../controllers/authController';
import { upload } from '../controllers/uploadController';

const router = Router();

router.post('/login', authController.login);
router.post('/signup', upload.single('logo'), authController.signup);
router.get('/verify-email/:token', authController.verifyEmail);

export default router;

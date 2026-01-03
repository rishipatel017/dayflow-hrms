import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id/profile', userController.updateProfile);
router.post('/:id/change-password', userController.changePassword);

import { upload } from '../controllers/uploadController';
router.post('/:id/documents', upload.single('document'), userController.uploadDocument);
router.delete('/:id/documents', userController.deleteDocument);
router.delete('/:id', userController.deleteUser);

export default router;

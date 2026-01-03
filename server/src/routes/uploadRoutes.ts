import { Router } from 'express';
import * as uploadController from '../controllers/uploadController';

const router = Router();

router.post('/', uploadController.upload.single('image'), uploadController.uploadProfilePicture);

export default router;

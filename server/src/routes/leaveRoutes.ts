import { Router } from 'express';
import * as leaveController from '../controllers/leaveController';
import { upload } from '../controllers/uploadController';

const router = Router();

router.get('/', leaveController.getAllLeaves);
router.post('/', upload.single('attachment'), leaveController.createLeaveRequest);
router.patch('/:id/status', leaveController.updateLeaveStatus);

export default router;

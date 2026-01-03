import { Router } from 'express';
import * as attendanceController from '../controllers/attendanceController';

const router = Router();

router.get('/', attendanceController.getAllAttendance);
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/today/:userId', attendanceController.getForUserToday);

export default router;

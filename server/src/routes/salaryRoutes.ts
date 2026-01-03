import { Router } from 'express';
import * as salaryController from '../controllers/salaryController';

const router = Router();

router.get('/:userId', salaryController.getSalaryByUserId);
router.put('/:userId', salaryController.updateSalary);

export default router;

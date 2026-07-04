import { Router } from 'express';
import {
  getPayrollOverview,
  generatePayslip,
  getMyPayslips,
  getPayslipDetails,
} from '../controller/payroll.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all routes in this file
router.use(protect);

router.get('/overview', authorize('admin'), getPayrollOverview);
router.post('/generate', authorize('admin'), generatePayslip);
router.get('/my-payslips', getMyPayslips);
router.get('/payslip/:id', getPayslipDetails);

export default router;

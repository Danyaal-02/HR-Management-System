import { Router } from 'express';
import {
  applyLeave,
  getBalancesAndLeaves,
  getAdminLeaveDashboard,
  approveRejectLeave,
  cancelLeave,
} from '../controller/leave.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(protect);

router.post('/apply', upload.single('attachment'), applyLeave);
router.get('/my-leaves', getBalancesAndLeaves);
router.put('/cancel/:id', cancelLeave);

router.get('/admin/requests', authorize('admin'), getAdminLeaveDashboard);
router.put('/admin/approve/:id', authorize('admin'), approveRejectLeave);

export default router;

import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getPersonalAttendance,
  getAdminAttendanceOverview,
} from '../controller/attendance.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all routes in this file
router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my-logs', getPersonalAttendance);
router.get('/overview', authorize('admin'), getAdminAttendanceOverview);

export default router;

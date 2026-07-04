import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updateSalary,
  getDashboardEmployees,
} from '../controller/profile.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// Protect all routes in this file
router.use(protect);

// GET /api/profile/list - List employees for dashboard
router.get('/list', getDashboardEmployees);

// GET /api/profile/:userId - View profile (self or admin)
router.get('/:userId', getProfile);

// PUT /api/profile/:userId - Update profile (self or admin)
router.put(
  '/:userId',
  upload.fields([
    { name: 'profile_picture', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
  ]),
  updateProfile
);

// PUT /api/profile/salary/:userId - Update salary details (admin only)
router.put('/salary/:userId', authorize('admin'), updateSalary);

export default router;

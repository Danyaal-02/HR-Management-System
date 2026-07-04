import { Router } from 'express';
import { signup, verifyEmail, login, createEmployee, changePassword } from '../controller/auth.controller.js';
import { signupValidation, loginValidation, createEmployeeValidation, changePasswordValidation } from '../middleware/validate.middleware.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/signup', signupValidation, signup);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginValidation, login);
router.post('/create-employee', protect, authorize('admin'), createEmployeeValidation, createEmployee);
router.put('/change-password', protect, changePasswordValidation, changePassword);

export default router;

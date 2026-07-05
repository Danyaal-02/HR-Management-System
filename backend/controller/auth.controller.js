import { COMMON_MESSAGES } from '../constants/messages.js';
import * as authService from '../services/auth.service.js';

// POST /api/auth/signup — Admin self-registers
export const signup = async (req, res) => {
  try {
    const data = await authService.signupService(req.body);

    return res.status(201).json({
      success: true,
      message: 'Account created. Please check your email to verify your account.',
      data,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Signup error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    await authService.verifyEmailService(token);

    return res.status(200).json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Verify email error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { login_id, password } = req.body;
    const data = await authService.loginService(login_id, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// POST /api/auth/create-employee — Admin only
export const createEmployee = async (req, res) => {
  try {
    const data = await authService.createEmployeeService(req.body);

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully.',
      data,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Create employee error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// PUT /api/auth/change-password — Logged-in user
export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    await authService.changePasswordService(req.user.id, current_password, new_password);

    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Change password error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

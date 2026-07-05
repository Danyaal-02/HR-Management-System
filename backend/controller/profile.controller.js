import { COMMON_MESSAGES } from '../constants/messages.js';
import * as profileService from '../services/profile.service.js';

// @desc    Get profile for self or any employee
// @route   GET /api/profile/:userId
export const getProfile = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    const data = await profileService.getProfileService(targetUserId, requestUserId, requestUserRole);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Get profile error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Update employee profile (Private Info, Hobbies, Skills, Certifications, Files)
// @route   PUT /api/profile/:userId
export const updateProfile = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    const requestUserId = req.user.id;
    const requestUserRole = req.user.role;

    await profileService.updateProfileService(targetUserId, requestUserId, requestUserRole, req.body, req.files);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Update profile error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Update employee salary details (Admin only)
// @route   PUT /api/profile/salary/:userId
export const updateSalary = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);

    const computed = await profileService.updateSalaryService(targetUserId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Salary updated successfully',
      data: computed,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Update salary error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Get list of employees for Landing Dashboard
// @route   GET /api/profile/list
export const getDashboardEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const { data, pagination } = await profileService.getDashboardEmployeesService(page, limit, search);

    return res.status(200).json({
      success: true,
      data,
      pagination,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Get employees list error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

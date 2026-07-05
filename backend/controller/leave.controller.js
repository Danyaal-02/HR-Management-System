import { COMMON_MESSAGES, LEAVE_MESSAGES } from '../constants/messages.js';
import * as leaveService from '../services/leave.service.js';

// @desc    Apply for leave
// @route   POST /api/leave/apply
// @access  Private (Employee/Admin)
export const applyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    await leaveService.applyLeaveService(userId, req.body, req.file);

    return res.status(201).json({
      success: true,
      message: LEAVE_MESSAGES.LEAVE_APPLIED,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Apply leave error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Get balances and personal leaves list for an employee
// @route   GET /api/leave/my-leaves
// @access  Private (Employee/Admin)
export const getBalancesAndLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, sortBy, sortDir } = req.query;

    const result = await leaveService.getBalancesAndLeavesService(userId, page, limit, sortBy, sortDir);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Get personal leaves error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Get all leave requests (Admin only)
// @route   GET /api/leave/admin/requests
// @access  Private (Admin only)
export const getAdminLeaveDashboard = async (req, res) => {
  try {
    const { search, status, page, limit, sortBy, sortDir } = req.query;

    const result = await leaveService.getAdminLeaveDashboardService(search, status, page, limit, sortBy, sortDir);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Get admin leaves error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Approve or reject a leave request (Admin only)
// @route   PUT /api/leave/admin/approve/:id
// @access  Private (Admin only)
export const approveRejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_comment } = req.body;

    await leaveService.approveRejectLeaveService(id, status, admin_comment);

    return res.status(200).json({
      success: true,
      message: LEAVE_MESSAGES.LEAVE_UPDATED,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Approve/Reject leave error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Cancel a pending leave request
// @route   PUT /api/leave/cancel/:id
// @access  Private (Employee)
export const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await leaveService.cancelLeaveService(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully.',
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Cancel leave error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

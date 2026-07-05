import { COMMON_MESSAGES } from '../constants/messages.js';
import * as attendanceService from '../services/attendance.service.js';

// @desc    Log check-in for today
// @route   POST /api/attendance/check-in
export const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    await attendanceService.checkInService(userId);

    return res.status(201).json({
      success: true,
      message: 'Checked in successfully.',
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Check-in error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Log check-out for today
// @route   POST /api/attendance/check-out
export const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await attendanceService.checkOutService(userId);

    return res.status(200).json({
      success: true,
      message: 'Checked out successfully.',
      data,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Check-out error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Get employee's own logs for a date range
// @route   GET /api/attendance/my-logs
export const getPersonalAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { start_date, end_date, page, limit, sortBy, sortDir } = req.query;

    const result = await attendanceService.getPersonalAttendanceService(userId, start_date, end_date, page, limit, sortBy, sortDir);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Get personal attendance logs error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Get complete attendance overview for a date (Admin only)
// @route   GET /api/attendance/overview
export const getAdminAttendanceOverview = async (req, res) => {
  try {
    const { date, search, page, limit, sortBy, sortDir } = req.query;

    const result = await attendanceService.getAdminAttendanceOverviewService(date, search, page, limit, sortBy, sortDir);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error('Get admin attendance overview error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

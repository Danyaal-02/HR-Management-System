import {
  insertLeaveRequest,
  getApprovedLeaveDaysSum,
  getPersonalLeaves,
  getAllLeaves,
  getLeaveRequestById,
  updateLeaveRequestStatus,
  bulkInsertAttendanceLeaves,
  hasOverlappingLeave,
} from '../db/leave.js';
import { formatDateString } from '../utils/date.util.js';
import { LEAVE_MESSAGES, COMMON_MESSAGES } from '../constants/messages.js';

// Helper to generate array of YYYY-MM-DD date strings in a range (inclusive)
const getDatesInRange = (startDateStr, endDateStr) => {
  const dates = [];
  const curr = new Date(startDateStr);
  const end = new Date(endDateStr);
  while (curr <= end) {
    const year = curr.getFullYear();
    const month = String(curr.getMonth() + 1).padStart(2, '0');
    const day = String(curr.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

// @desc    Apply for leave
// @route   POST /api/leave/apply
// @access  Private (Employee/Admin)
export const applyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leave_type, start_date, end_date, remarks } = req.body;

    if (!leave_type || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Leave type, start date, and end date are required.',
      });
    }

    // Normalize leave type label to match database enum ('paid', 'sick', 'unpaid')
    let normalizedLeaveType = leave_type.toLowerCase().trim();
    if (normalizedLeaveType.includes('paid')) {
      normalizedLeaveType = 'paid';
    } else if (normalizedLeaveType.includes('sick')) {
      normalizedLeaveType = 'sick';
    } else if (normalizedLeaveType.includes('unpaid')) {
      normalizedLeaveType = 'unpaid';
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type. Must be 'Paid time off', 'Sick Leave', or 'Unpaid Leaves'.",
      });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return res.status(400).json({
        success: false,
        message: LEAVE_MESSAGES.INVALID_DATE_RANGE,
      });
    }

    // Check for overlapping leaves (pending or approved)
    const overlapExists = await hasOverlappingLeave(userId, start_date, end_date);
    if (overlapExists) {
      return res.status(400).json({
        success: false,
        message: LEAVE_MESSAGES.OVERLAPPING_LEAVE,
      });
    }

    // Enforce attachment for sick leaves
    if (normalizedLeaveType === 'sick' && !req.file) {
      return res.status(400).json({
        success: false,
        message: LEAVE_MESSAGES.SICK_LEAVE_CERT_REQUIRED,
      });
    }

    // Calculate inclusive request days
    const diffTime = Math.abs(end - start);
    const daysRequested = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check balances dynamically (Paid: 24 days, Sick: 7 days)
    if (normalizedLeaveType === 'paid' || normalizedLeaveType === 'sick') {
      const sums = await getApprovedLeaveDaysSum(userId);
      if (normalizedLeaveType === 'paid') {
        const approvedPaid = parseFloat(sums.approved_paid) || 0;
        if (approvedPaid + daysRequested > 24) {
          return res.status(400).json({
            success: false,
            message: LEAVE_MESSAGES.INSUFFICIENT_BALANCE,
          });
        }
      } else if (normalizedLeaveType === 'sick') {
        const approvedSick = parseFloat(sums.approved_sick) || 0;
        if (approvedSick + daysRequested > 7) {
          return res.status(400).json({
            success: false,
            message: LEAVE_MESSAGES.INSUFFICIENT_BALANCE,
          });
        }
      }
    }

    const attachmentUrl = req.file ? req.file.path : null;

    await insertLeaveRequest({
      user_id: userId,
      leave_type: normalizedLeaveType,
      start_date,
      end_date,
      days_requested: daysRequested,
      remarks: remarks || null,
      attachment_url: attachmentUrl,
    });

    return res.status(201).json({
      success: true,
      message: LEAVE_MESSAGES.LEAVE_APPLIED,
    });
  } catch (error) {
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
    let { page, limit, sortBy, sortDir } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    // Get dynamic leave sums
    const sums = await getApprovedLeaveDaysSum(userId);
    const approvedPaid = parseFloat(sums.approved_paid) || 0;
    const approvedSick = parseFloat(sums.approved_sick) || 0;

    // Standard starting balances: Paid: 24, Sick: 7
    const availablePaid = Math.max(0, 24 - approvedPaid);
    const availableSick = Math.max(0, 7 - approvedSick);

    const { rows: leaves, total } = await getPersonalLeaves(userId, {
      limit: limitNum,
      offset,
      sortBy,
      sortDir
    });

    const formattedLeaves = leaves.map(leave => ({
      id: leave.id,
      leave_type: leave.leave_type,
      start_date: formatDateString(leave.start_date),
      end_date: formatDateString(leave.end_date),
      days_requested: parseFloat(leave.days_requested),
      remarks: leave.remarks,
      attachment_url: leave.attachment_url,
      status: leave.status,
      admin_comment: leave.admin_comment,
      created_at: leave.created_at,
    }));

    return res.status(200).json({
      success: true,
      balances: {
        paid: availablePaid,
        sick: availableSick,
      },
      leaves: formattedLeaves,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    });
  } catch (error) {
    console.error('Get personal leaves error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Get all leave requests (Admin only)
// @route   GET /api/leave/admin/requests
// @access  Private (Admin only)
export const getAdminLeaveDashboard = async (req, res) => {
  try {
    let { search, status, page, limit, sortBy, sortDir } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const { rows: requests, total } = await getAllLeaves({
      search: search || '',
      status: status || 'all',
      limit: limitNum,
      offset,
      sortBy,
      sortDir
    });

    const formattedRequests = requests.map(leave => ({
      id: leave.id,
      user_id: leave.user_id,
      first_name: leave.first_name,
      last_name: leave.last_name,
      employee_id: leave.employee_id,
      leave_type: leave.leave_type,
      start_date: formatDateString(leave.start_date),
      end_date: formatDateString(leave.end_date),
      days_requested: parseFloat(leave.days_requested),
      remarks: leave.remarks,
      attachment_url: leave.attachment_url,
      status: leave.status,
      admin_comment: leave.admin_comment,
      created_at: leave.created_at,
    }));

    return res.status(200).json({
      success: true,
      data: formattedRequests,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    });
  } catch (error) {
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

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status is required and must be either 'approved' or 'rejected'.",
      });
    }

    const leaveRequest = await getLeaveRequestById(id);
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: LEAVE_MESSAGES.LEAVE_NOT_FOUND,
      });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Leave request has already been ${leaveRequest.status}.`,
      });
    }

    await updateLeaveRequestStatus(id, status, admin_comment || null);

    // If approved, sync 'leave' rows into the attendances table for all range dates
    if (status === 'approved') {
      const datesArray = getDatesInRange(leaveRequest.start_date, leaveRequest.end_date);
      await bulkInsertAttendanceLeaves(leaveRequest.user_id, datesArray);
    }

    return res.status(200).json({
      success: true,
      message: LEAVE_MESSAGES.LEAVE_UPDATED,
    });
  } catch (error) {
    console.error('Approve/Reject leave error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

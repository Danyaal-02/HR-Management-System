import {
  insertLeaveRequest,
  getApprovedLeaveDaysSum,
  getPersonalLeaves,
  getAllLeaves,
  getLeaveRequestById,
  updateLeaveRequestStatus,
  bulkInsertAttendanceLeaves,
  hasOverlappingLeave,
  cancelLeaveRequest,
} from '../db/leave.js';
import { formatDateString } from '../utils/date.util.js';
import { LEAVE_MESSAGES } from '../constants/messages.js';

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

export const applyLeaveService = async (userId, data, file) => {
  const { leave_type, start_date, end_date, remarks } = data;

  if (!leave_type || !start_date || !end_date) {
    const err = new Error('Leave type, start date, and end date are required.');
    err.status = 400;
    throw err;
  }

  let normalizedLeaveType = leave_type.toLowerCase().trim();
  if (normalizedLeaveType.includes('paid')) {
    normalizedLeaveType = 'paid';
  } else if (normalizedLeaveType.includes('sick')) {
    normalizedLeaveType = 'sick';
  } else if (normalizedLeaveType.includes('unpaid')) {
    normalizedLeaveType = 'unpaid';
  } else {
    const err = new Error("Invalid leave type. Must be 'Paid time off', 'Sick Leave', or 'Unpaid Leaves'.");
    err.status = 400;
    throw err;
  }

  const start = new Date(start_date);
  const end = new Date(end_date);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    const err = new Error(LEAVE_MESSAGES.INVALID_DATE_RANGE);
    err.status = 400;
    throw err;
  }

  const overlapExists = await hasOverlappingLeave(userId, start_date, end_date);
  if (overlapExists) {
    const err = new Error(LEAVE_MESSAGES.OVERLAPPING_LEAVE);
    err.status = 400;
    throw err;
  }

  if (normalizedLeaveType === 'sick' && !file) {
    const err = new Error(LEAVE_MESSAGES.SICK_LEAVE_CERT_REQUIRED);
    err.status = 400;
    throw err;
  }

  const diffTime = Math.abs(end - start);
  const daysRequested = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (normalizedLeaveType === 'paid' || normalizedLeaveType === 'sick') {
    const sums = await getApprovedLeaveDaysSum(userId);
    if (normalizedLeaveType === 'paid') {
      const approvedPaid = parseFloat(sums.approved_paid) || 0;
      if (approvedPaid + daysRequested > 24) {
        const err = new Error(LEAVE_MESSAGES.INSUFFICIENT_BALANCE);
        err.status = 400;
        throw err;
      }
    } else if (normalizedLeaveType === 'sick') {
      const approvedSick = parseFloat(sums.approved_sick) || 0;
      if (approvedSick + daysRequested > 7) {
        const err = new Error(LEAVE_MESSAGES.INSUFFICIENT_BALANCE);
        err.status = 400;
        throw err;
      }
    }
  }

  const attachmentUrl = file ? file.path : null;

  await insertLeaveRequest({
    user_id: userId,
    leave_type: normalizedLeaveType,
    start_date,
    end_date,
    days_requested: daysRequested,
    remarks: remarks || null,
    attachment_url: attachmentUrl,
  });

  return true;
};

export const getBalancesAndLeavesService = async (userId, page, limit, sortBy, sortDir) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const offset = (pageNum - 1) * limitNum;

  const sums = await getApprovedLeaveDaysSum(userId);
  const approvedPaid = parseFloat(sums.approved_paid) || 0;
  const approvedSick = parseFloat(sums.approved_sick) || 0;

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

  return {
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
  };
};

export const getAdminLeaveDashboardService = async (search, status, page, limit, sortBy, sortDir) => {
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

  return {
    data: formattedRequests,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    }
  };
};

export const approveRejectLeaveService = async (id, status, admin_comment) => {
  if (!status || !['approved', 'rejected'].includes(status)) {
    const err = new Error("Status is required and must be either 'approved' or 'rejected'.");
    err.status = 400;
    throw err;
  }

  const leaveRequest = await getLeaveRequestById(id);
  if (!leaveRequest) {
    const err = new Error(LEAVE_MESSAGES.LEAVE_NOT_FOUND);
    err.status = 404;
    throw err;
  }

  if (leaveRequest.status !== 'pending') {
    const err = new Error(`Leave request has already been ${leaveRequest.status}.`);
    err.status = 400;
    throw err;
  }

  await updateLeaveRequestStatus(id, status, admin_comment || null);

  if (status === 'approved') {
    const datesArray = getDatesInRange(leaveRequest.start_date, leaveRequest.end_date);
    await bulkInsertAttendanceLeaves(leaveRequest.user_id, datesArray);
  }

  return true;
};

export const cancelLeaveService = async (id, userId) => {
  const leaveRequest = await getLeaveRequestById(id);
  if (!leaveRequest) {
    const err = new Error(LEAVE_MESSAGES.LEAVE_NOT_FOUND);
    err.status = 404;
    throw err;
  }

  if (leaveRequest.user_id !== userId) {
    const err = new Error('You are not authorized to cancel this leave request.');
    err.status = 403;
    throw err;
  }

  if (leaveRequest.status !== 'pending') {
    const err = new Error(`Only pending requests can be cancelled. This request is already ${leaveRequest.status}.`);
    err.status = 400;
    throw err;
  }

  const success = await cancelLeaveRequest(id, userId);
  if (!success) {
    const err = new Error('Failed to cancel the leave request.');
    err.status = 400;
    throw err;
  }

  return true;
};

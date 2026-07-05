import {
  getTodayAttendance,
  insertCheckIn,
  updateCheckOut,
  getEmployeeAttendanceHistory,
  getAllAttendance,
} from '../db/attendance.js';
import { getLocalDateString, formatDateString } from '../utils/date.util.js';
import { ATTENDANCE_MESSAGES, COMMON_MESSAGES } from '../constants/messages.js';

// @desc    Log check-in for today
// @route   POST /api/attendance/check-in
export const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getLocalDateString();

    // Check if user already checked in today
    const existingRecord = await getTodayAttendance(userId, today);
    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: ATTENDANCE_MESSAGES.ALREADY_CHECKED_IN,
      });
    }

    await insertCheckIn(userId, today);

    return res.status(201).json({
      success: true,
      message: ATTENDANCE_MESSAGES.CHECK_IN_SUCCESS,
    });
  } catch (error) {
    console.error('Check-in error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Log check-out for today
// @route   POST /api/attendance/check-out
export const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getLocalDateString();

    // Find today's attendance record
    const record = await getTodayAttendance(userId, today);
    if (!record) {
      return res.status(400).json({
        success: false,
        message: ATTENDANCE_MESSAGES.NOT_CHECKED_IN_TODAY,
      });
    }

    if (record.check_out) {
      return res.status(400).json({
        success: false,
        message: ATTENDANCE_MESSAGES.ALREADY_CHECKED_OUT,
      });
    }

    // Calculate elapsed hours
    const checkInStr = record.check_in; // e.g. "09:30:00"
    const [ch, cm, cs] = checkInStr.split(':').map(Number);
    
    const checkInTime = new Date();
    checkInTime.setHours(ch, cm, cs || 0, 0);

    const now = new Date();
    const elapsedMs = now.getTime() - checkInTime.getTime();
    
    // Convert to hours (decimals)
    const elapsedHours = parseFloat((elapsedMs / (1000 * 60 * 60)).toFixed(2));

    // Shift rules: 9-hour shift.
    // Present if working >= 4.5 hours (half shift), otherwise Half-day
    const status = elapsedHours >= 4.5 ? 'present' : 'half-day';

    await updateCheckOut(userId, today, elapsedHours, status);

    const extraHours = parseFloat(Math.max(0, elapsedHours - 8.00).toFixed(2));

    return res.status(200).json({
      success: true,
      message: ATTENDANCE_MESSAGES.CHECK_OUT_SUCCESS,
      data: {
        check_in: checkInStr,
        check_out: now.toLocaleTimeString('en-US', { hour12: false }),
        work_hours: elapsedHours,
        extra_hours: extraHours,
        status: status,
      },
    });
  } catch (error) {
    console.error('Check-out error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Get employee's own logs for a date range
// @route   GET /api/attendance/my-logs
export const getPersonalAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    let { start_date, end_date, page, limit, sortBy, sortDir } = req.query;

    // Default to current month if dates are not provided
    if (!start_date || !end_date) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      
      // Default to 1st of month to today
      if (!start_date) start_date = `${year}-${month}-01`;
      if (!end_date) end_date = getLocalDateString();
    }

    // Basic date format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
      return res.status(400).json({
        success: false,
        message: ATTENDANCE_MESSAGES.INVALID_DATE_RANGE,
      });
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const { rows: logs, total } = await getEmployeeAttendanceHistory(userId, start_date, end_date, {
      limit: limitNum,
      offset,
      sortBy,
      sortDir
    });

    // Mapped logs with calculated extra_hours and clean date string
    let daysPresent = 0;
    let daysLeave = 0;

    const formattedLogs = logs.map((log) => {
      const workHours = parseFloat(log.work_hours) || 0.00;
      const extraHours = parseFloat(Math.max(0, workHours - 8.00).toFixed(2));

      if (log.status === 'present' || log.status === 'half-day') {
        daysPresent += 1;
      } else if (log.status === 'leave') {
        daysLeave += 1;
      }

      return {
        date: formatDateString(log.date),
        check_in: log.check_in,
        check_out: log.check_out,
        status: log.status,
        work_hours: workHours,
        extra_hours: extraHours,
      };
    });

    return res.status(200).json({
      success: true,
      summary: {
        days_present: daysPresent,
        days_leave: daysLeave,
        total_working_days: total, // note this might be different due to pagination, but it represents total in range
      },
      data: formattedLogs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    });
  } catch (error) {
    console.error('Get personal attendance logs error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Get complete attendance overview for a date (Admin only)
// @route   GET /api/attendance/overview
export const getAdminAttendanceOverview = async (req, res) => {
  try {
    let { date, search, page, limit, sortBy, sortDir } = req.query;
    if (!date) {
      date = getLocalDateString();
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: ATTENDANCE_MESSAGES.INVALID_DATE_RANGE,
      });
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const { rows: overview, total } = await getAllAttendance(date, {
      search: search || '',
      limit: limitNum,
      offset,
      sortBy,
      sortDir
    });

    // Map logs to include computed extra hours
    const overviewWithExtra = overview.map((row) => {
      const workHours = parseFloat(row.work_hours) || 0.00;
      const extraHours = parseFloat(Math.max(0, workHours - 8.00).toFixed(2));

      return {
        user_id: row.user_id,
        employee_id: row.employee_id,
        first_name: row.first_name,
        last_name: row.last_name,
        department: row.department,
        designation: row.designation,
        check_in: row.check_in,
        check_out: row.check_out,
        status: row.status || 'absent',
        work_hours: workHours,
        extra_hours: extraHours,
      };
    });

    return res.status(200).json({
      success: true,
      data: overviewWithExtra,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    });
  } catch (error) {
    console.error('Get admin attendance overview error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

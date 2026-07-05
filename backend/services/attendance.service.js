import {
  getTodayAttendance,
  insertCheckIn,
  updateCheckOut,
  getEmployeeAttendanceHistory,
  getAllAttendance,
} from '../db/attendance.js';
import { getLocalDateString, formatDateString } from '../utils/date.util.js';
import { ATTENDANCE_MESSAGES } from '../constants/messages.js';

const computeDynamicWorkHours = (checkIn, checkOut, dbWorkHours, recordDateStr) => {
  const parsed = parseFloat(dbWorkHours);
  if (parsed > 0) return parsed;
  if (!checkIn) return 0.00;
  
  const [inH, inM, inS] = checkIn.split(':').map(Number);
  const inDate = new Date();
  inDate.setHours(inH, inM, inS || 0, 0);
  
  let outDate = new Date();
  if (checkOut) {
    const [outH, outM, outS] = checkOut.split(':').map(Number);
    outDate.setHours(outH, outM, outS || 0, 0);
  } else {
    const todayStr = getLocalDateString();
    if (recordDateStr && recordDateStr !== todayStr) {
       return 0.00;
    }
  }
  
  if (outDate < inDate) {
    outDate.setDate(outDate.getDate() + 1); 
  }
  
  const diffMs = outDate.getTime() - inDate.getTime();
  const hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  return Math.max(0, hours);
};

export const checkInService = async (userId) => {
  const today = getLocalDateString();
  const existingRecord = await getTodayAttendance(userId, today);
  
  if (existingRecord) {
    const err = new Error(ATTENDANCE_MESSAGES.ALREADY_CHECKED_IN);
    err.status = 400;
    throw err;
  }

  await insertCheckIn(userId, today);
  return true;
};

export const checkOutService = async (userId) => {
  const today = getLocalDateString();
  const record = await getTodayAttendance(userId, today);
  
  if (!record) {
    const err = new Error(ATTENDANCE_MESSAGES.NOT_CHECKED_IN_TODAY);
    err.status = 400;
    throw err;
  }

  if (record.check_out) {
    const err = new Error(ATTENDANCE_MESSAGES.ALREADY_CHECKED_OUT);
    err.status = 400;
    throw err;
  }

  const checkInStr = record.check_in;
  const [ch, cm, cs] = checkInStr.split(':').map(Number);
  
  const checkInTime = new Date();
  checkInTime.setHours(ch, cm, cs || 0, 0);

  const now = new Date();
  const elapsedMs = now.getTime() - checkInTime.getTime();
  const elapsedHours = parseFloat((elapsedMs / (1000 * 60 * 60)).toFixed(2));

  const status = elapsedHours >= 4.5 ? 'present' : 'half-day';

  await updateCheckOut(userId, today, elapsedHours, status);

  const extraHours = parseFloat(Math.max(0, elapsedHours - 8.00).toFixed(2));

  return {
    check_in: checkInStr,
    check_out: now.toLocaleTimeString('en-US', { hour12: false }),
    work_hours: elapsedHours,
    extra_hours: extraHours,
    status: status,
  };
};

export const getPersonalAttendanceService = async (userId, start_date, end_date, page, limit, sortBy, sortDir) => {
  if (!start_date || !end_date) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    if (!start_date) start_date = `${year}-${month}-01`;
    if (!end_date) end_date = getLocalDateString();
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
    const err = new Error(ATTENDANCE_MESSAGES.INVALID_DATE_RANGE);
    err.status = 400;
    throw err;
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

  let daysPresent = 0;
  let daysLeave = 0;

  const formattedLogs = logs.map((log) => {
    const rawDateStr = new Date(log.date).toISOString().split('T')[0];
    const workHours = computeDynamicWorkHours(log.check_in, log.check_out, log.work_hours, rawDateStr);
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

  return {
    summary: {
      days_present: daysPresent,
      days_leave: daysLeave,
      total_working_days: total,
    },
    data: formattedLogs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    }
  };
};

export const getAdminAttendanceOverviewService = async (date, search, page, limit, sortBy, sortDir) => {
  if (!date) {
    date = getLocalDateString();
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    const err = new Error(ATTENDANCE_MESSAGES.INVALID_DATE_RANGE);
    err.status = 400;
    throw err;
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

  const overviewWithExtra = overview.map((row) => {
    const rawDateStr = date; 
    const workHours = computeDynamicWorkHours(row.check_in, row.check_out, row.work_hours, rawDateStr);
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

  return {
    data: overviewWithExtra,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    }
  };
};

import { findAllUsers } from '../db/user.js';
import { getSalaryByUserId } from '../db/profile.js';
import { getEmployeeAttendanceHistory } from '../db/attendance.js';
import { getPersonalLeaves } from '../db/leave.js';
import {
  insertPayslip,
  getPersonalPayslipsList,
  getAllGeneratedPayslips,
  getPayslipById,
} from '../db/payroll.js';
import { calculateSalaryDetails } from '../utils/salary.util.js';
import { PAYROLL_MESSAGES, COMMON_MESSAGES } from '../constants/messages.js';

// Helper to perform payroll math for an employee, month, and year
const computePayrollForEmployee = async (userId, month, year) => {
  const salarySettings = await getSalaryByUserId(userId);
  if (!salarySettings) return null;

  const totalDays = new Date(year, month, 0).getDate(); // Total days in this month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(totalDays).padStart(2, '0')}`;

  // Get attendance logs
  const attendanceLogs = await getEmployeeAttendanceHistory(userId, startDate, endDate);
  
  // Format dates for map comparison
  const attendanceMap = new Map();
  attendanceLogs.forEach((log) => {
    // Format date in YYYY-MM-DD format
    const d = new Date(log.date);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    attendanceMap.set(dateStr, log);
  });

  // Get approved leaves for the date range
  const leaves = await getPersonalLeaves(userId);
  const approvedLeaves = leaves.filter((l) => l.status === 'approved');

  let unpaidLeaves = 0;
  let missingAttendance = 0;
  let halfDays = 0;
  let presentDays = 0;

  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const d = new Date(dateStr);
    const isWeekend = (d.getDay() === 0 || d.getDay() === 6); // Sunday = 0, Saturday = 6

    const attendance = attendanceMap.get(dateStr);

    if (attendance) {
      if (attendance.status === 'present') {
        presentDays += 1;
      } else if (attendance.status === 'half-day') {
        halfDays += 1;
      } else if (attendance.status === 'leave') {
        // Find if it was unpaid
        const activeLeave = approvedLeaves.find((l) => {
          const start = new Date(l.start_date);
          const end = new Date(l.end_date);
          return d >= start && d <= end;
        });

        if (activeLeave && activeLeave.leave_type === 'unpaid') {
          unpaidLeaves += 1;
        } else {
          // Paid or Sick leaves are payable
          presentDays += 1;
        }
      }
    } else {
      if (isWeekend) {
        // Weekends are paid rest days
        presentDays += 1;
      } else {
        // Weekday with no check-in. Check if covered by an approved leave
        const activeLeave = approvedLeaves.find((l) => {
          const start = new Date(l.start_date);
          const end = new Date(l.end_date);
          return d >= start && d <= end;
        });

        if (activeLeave) {
          if (activeLeave.leave_type === 'unpaid') {
            unpaidLeaves += 1;
          } else {
            presentDays += 1;
          }
        } else {
          missingAttendance += 1;
        }
      }
    }
  }

  // Count half-days as 0.5 payable day reduction
  const payableDays = presentDays + (halfDays * 0.5);

  const baseMonthWage = parseFloat(salarySettings.month_wage) || 0.00;
  const ratio = payableDays / totalDays;
  const actualMonthWage = parseFloat((baseMonthWage * ratio).toFixed(2));

  // Scale custom salary breakdown settings by ratio
  const customSettings = {
    basic_salary_type: salarySettings.basic_salary_type,
    basic_salary_value: salarySettings.basic_salary_type === 'fixed' 
      ? (parseFloat(salarySettings.basic_salary_value) * ratio) 
      : salarySettings.basic_salary_value,
    hra_type: salarySettings.hra_type,
    hra_value: salarySettings.hra_type === 'fixed' 
      ? (parseFloat(salarySettings.hra_value) * ratio) 
      : salarySettings.hra_value,
    standard_allowance: (parseFloat(salarySettings.standard_allowance) || 4167.00) * ratio,
    performance_bonus_type: salarySettings.performance_bonus_type,
    performance_bonus_value: salarySettings.performance_bonus_type === 'fixed'
      ? (parseFloat(salarySettings.performance_bonus_value) * ratio)
      : salarySettings.performance_bonus_value,
    lta_type: salarySettings.lta_type,
    lta_value: salarySettings.lta_type === 'fixed'
      ? (parseFloat(salarySettings.lta_value) * ratio)
      : salarySettings.lta_value,
    pf_rate: salarySettings.pf_rate,
    prof_tax: salarySettings.prof_tax
  };

  const computedBreakdown = calculateSalaryDetails(actualMonthWage, customSettings);

  return {
    user_id: userId,
    month,
    year,
    total_days: totalDays,
    payable_days: payableDays,
    unpaid_leaves: unpaidLeaves,
    missing_attendance: missingAttendance,
    base_month_wage: baseMonthWage,
    actual_month_wage: actualMonthWage,
    basic: computedBreakdown.calculated.basic,
    hra: computedBreakdown.calculated.hra,
    standard_allowance: computedBreakdown.calculated.standard_allowance,
    performance_bonus: computedBreakdown.calculated.performance_bonus,
    lta: computedBreakdown.calculated.lta,
    fixed_allowance: computedBreakdown.calculated.fixed_allowance,
    pf_deduction: computedBreakdown.calculated.employee_pf,
    prof_tax: computedBreakdown.calculated.prof_tax,
    net_salary: actualMonthWage - computedBreakdown.calculated.employee_pf - computedBreakdown.calculated.prof_tax,
  };
};

// @desc    Get dry-run payroll preview for all employees (Admin only)
// @route   GET /api/payroll/overview
// @access  Private (Admin only)
export const getPayrollOverview = async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: PAYROLL_MESSAGES.INVALID_MONTH_YEAR });
    }

    const employees = await findAllUsers();
    // Exclude other admins
    const regularEmployees = employees.filter(emp => emp.role !== 'admin');

    const previewData = [];

    for (const emp of regularEmployees) {
      const payroll = await computePayrollForEmployee(emp.id, month, year);
      previewData.push({
        id: emp.id,
        employee_id: emp.employee_id,
        first_name: emp.first_name,
        last_name: emp.last_name,
        department: emp.department,
        designation: emp.designation,
        has_salary_structure: !!payroll,
        payroll: payroll || null,
      });
    }

    return res.status(200).json({
      success: true,
      data: previewData,
    });
  } catch (error) {
    console.error('Get payroll overview error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Generate and save official payslip (Admin only)
// @route   POST /api/payroll/generate
// @access  Private (Admin only)
export const generatePayslip = async (req, res) => {
  try {
    const { user_id, month, year } = req.body;

    if (!user_id || !month || !year || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: 'Valid user_id, month, and year are required.',
      });
    }

    // Check if salary structure is configured
    const salarySettings = await getSalaryByUserId(user_id);
    if (!salarySettings) {
      return res.status(400).json({
        success: false,
        message: PAYROLL_MESSAGES.NO_SALARY_STRUCTURE,
      });
    }

    const payrollData = await computePayrollForEmployee(user_id, month, year);
    await insertPayslip(payrollData);

    return res.status(201).json({
      success: true,
      message: PAYROLL_MESSAGES.PAYROLL_GENERATED,
      data: payrollData,
    });
  } catch (error) {
    console.error('Generate payslip error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Get history of my own payslips (Employee/Admin)
// @route   GET /api/payroll/my-payslips
// @access  Private
export const getMyPayslips = async (req, res) => {
  try {
    const userId = req.user.id;
    const payslips = await getPersonalPayslipsList(userId);

    return res.status(200).json({
      success: true,
      data: payslips,
    });
  } catch (error) {
    console.error('Get my payslips error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

// @desc    Get details of a single payslip (Employee/Admin)
// @route   GET /api/payroll/payslip/:id
// @access  Private
export const getPayslipDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const payslip = await getPayslipById(id);

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: PAYROLL_MESSAGES.PAYSLIP_NOT_FOUND,
      });
    }

    // Access control: Employees can only view their own payslips
    if (req.user.role !== 'admin' && payslip.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: PAYROLL_MESSAGES.ACCESS_DENIED_PAYSLIP,
      });
    }

    return res.status(200).json({
      success: true,
      data: payslip,
    });
  } catch (error) {
    console.error('Get payslip details error:', error.message);
    return res.status(500).json({ success: false, message: COMMON_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

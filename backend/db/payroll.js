import pool from '../config/db.connection.js';

export const createPayrollTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS payslips (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      month INT NOT NULL,
      year INT NOT NULL,
      total_days INT NOT NULL,
      payable_days DECIMAL(5, 2) NOT NULL,
      unpaid_leaves DECIMAL(5, 2) NOT NULL,
      missing_attendance DECIMAL(5, 2) NOT NULL,
      base_month_wage DECIMAL(12, 2) NOT NULL,
      actual_month_wage DECIMAL(12, 2) NOT NULL,
      basic DECIMAL(12, 2) NOT NULL,
      hra DECIMAL(12, 2) NOT NULL,
      standard_allowance DECIMAL(12, 2) NOT NULL,
      performance_bonus DECIMAL(12, 2) NOT NULL,
      lta DECIMAL(12, 2) NOT NULL,
      fixed_allowance DECIMAL(12, 2) NOT NULL,
      pf_deduction DECIMAL(12, 2) NOT NULL,
      prof_tax DECIMAL(12, 2) NOT NULL,
      net_salary DECIMAL(12, 2) NOT NULL,
      status ENUM('draft', 'generated', 'paid') NOT NULL DEFAULT 'generated',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY user_month_year (user_id, month, year)
    )
  `;

  try {
    await pool.query(sql);
    console.log('Payslips table initialized successfully');
  } catch (error) {
    console.error('Error creating payslips table:', error.message);
    throw error;
  }
};

// ----- Query Helpers -----

// Insert a new generated payslip
export const insertPayslip = async (data) => {
  const sql = `
    INSERT INTO payslips (
      user_id, month, year, total_days, payable_days, unpaid_leaves, missing_attendance, 
      base_month_wage, actual_month_wage, basic, hra, standard_allowance, 
      performance_bonus, lta, fixed_allowance, pf_deduction, prof_tax, net_salary, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      total_days = VALUES(total_days),
      payable_days = VALUES(payable_days),
      unpaid_leaves = VALUES(unpaid_leaves),
      missing_attendance = VALUES(missing_attendance),
      base_month_wage = VALUES(base_month_wage),
      actual_month_wage = VALUES(actual_month_wage),
      basic = VALUES(basic),
      hra = VALUES(hra),
      standard_allowance = VALUES(standard_allowance),
      performance_bonus = VALUES(performance_bonus),
      lta = VALUES(lta),
      fixed_allowance = VALUES(fixed_allowance),
      pf_deduction = VALUES(pf_deduction),
      prof_tax = VALUES(prof_tax),
      net_salary = VALUES(net_salary),
      status = VALUES(status)
  `;

  const [result] = await pool.query(sql, [
    data.user_id, data.month, data.year, data.total_days, data.payable_days, data.unpaid_leaves, data.missing_attendance,
    data.base_month_wage, data.actual_month_wage, data.basic, data.hra, data.standard_allowance,
    data.performance_bonus, data.lta, data.fixed_allowance, data.pf_deduction, data.prof_tax, data.net_salary, data.status || 'generated'
  ]);

  return result.insertId;
};

// Fetch payslip by user and month/year
export const getPayslipByMonthYear = async (userId, month, year) => {
  const sql = `SELECT * FROM payslips WHERE user_id = ? AND month = ? AND year = ?`;
  const [rows] = await pool.query(sql, [userId, month, year]);
  return rows[0] || null;
};

// Fetch personal payslips list for an employee
export const getPersonalPayslipsList = async (userId) => {
  const sql = `
    SELECT id, month, year, payable_days, base_month_wage, actual_month_wage, net_salary, status, created_at
    FROM payslips
    WHERE user_id = ?
    ORDER BY year DESC, month DESC
  `;
  const [rows] = await pool.query(sql, [userId]);
  return rows;
};

// Fetch all generated payslips for admin (filtered by month/year)
export const getAllGeneratedPayslips = async (month, year) => {
  const sql = `
    SELECT 
      p.id, 
      p.user_id,
      u.first_name,
      u.last_name,
      u.employee_id,
      u.department,
      u.designation,
      p.month, 
      p.year, 
      p.payable_days, 
      p.base_month_wage, 
      p.actual_month_wage, 
      p.net_salary, 
      p.status
    FROM payslips p
    JOIN users u ON p.user_id = u.id
    WHERE p.month = ? AND p.year = ?
    ORDER BY u.first_name ASC
  `;
  const [rows] = await pool.query(sql, [month, year]);
  return rows;
};

// Get details of a single payslip with user details joined
export const getPayslipById = async (id) => {
  const sql = `
    SELECT 
      p.*,
      u.first_name,
      u.last_name,
      u.employee_id,
      u.department,
      u.designation,
      u.date_of_joining
    FROM payslips p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `;
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
};

import pool from '../config/db.connection.js';

export const createAttendanceTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS attendances (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      date DATE NOT NULL,
      check_in TIME DEFAULT NULL,
      check_out TIME DEFAULT NULL,
      status ENUM('present', 'absent', 'half-day', 'leave') NOT NULL DEFAULT 'absent',
      work_hours DECIMAL(5, 2) DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY user_date (user_id, date)
    )
  `;

  try {
    await pool.query(sql);
    console.log('Attendances table initialized successfully');
  } catch (error) {
    console.error('Error creating attendances table:', error.message);
    throw error;
  }
};

// ----- Query Helpers -----

// Get today's attendance record for user
export const getTodayAttendance = async (userId, date) => {
  const [rows] = await pool.query(
    'SELECT * FROM attendances WHERE user_id = ? AND date = ?',
    [userId, date]
  );
  return rows[0] || null;
};

// Insert new check-in row for today
export const insertCheckIn = async (userId, date) => {
  const sql = `
    INSERT INTO attendances (user_id, date, check_in, status)
    VALUES (?, ?, CURRENT_TIME(), 'present')
  `;
  const [result] = await pool.query(sql, [userId, date]);
  return result.insertId;
};

// Update check-out log for today
export const updateCheckOut = async (userId, date, workHours, status) => {
  const sql = `
    UPDATE attendances
    SET check_out = CURRENT_TIME(), work_hours = ?, status = ?
    WHERE user_id = ? AND date = ?
  `;
  const [result] = await pool.query(sql, [workHours, status, userId, date]);
  return result.affectedRows > 0;
};

// Get personal attendance logs for date range
export const getEmployeeAttendanceHistory = async (userId, startDate, endDate) => {
  const sql = `
    SELECT date, check_in, check_out, status, work_hours 
    FROM attendances 
    WHERE user_id = ? AND date BETWEEN ? AND ?
    ORDER BY date DESC
  `;
  const [rows] = await pool.query(sql, [userId, startDate, endDate]);
  return rows;
};

// Get all attendance overview for a specific date (for admin)
export const getAllAttendance = async (date) => {
  const sql = `
    SELECT 
      u.id as user_id, 
      u.employee_id, 
      u.first_name, 
      u.last_name, 
      u.department, 
      u.designation,
      a.check_in, 
      a.check_out, 
      a.status, 
      a.work_hours
    FROM users u
    LEFT JOIN attendances a ON u.id = a.user_id AND a.date = ?
    WHERE u.role != 'admin'
    ORDER BY u.first_name ASC
  `;
  const [rows] = await pool.query(sql, [date]);
  return rows;
};

// Get all employees with their live attendance status for today
export const getEmployeesWithTodayStatus = async (date) => {
  const sql = `
    SELECT 
      u.id, 
      u.employee_id, 
      u.first_name, 
      u.last_name, 
      u.email, 
      u.role, 
      u.phone, 
      u.department, 
      u.designation, 
      u.date_of_joining, 
      u.profile_picture,
      a.status as today_status,
      a.check_in,
      a.check_out
    FROM users u
    LEFT JOIN attendances a ON u.id = a.user_id AND a.date = ?
    WHERE u.role != 'admin'
    ORDER BY u.first_name ASC
  `;
  const [rows] = await pool.query(sql, [date]);
  return rows;
};

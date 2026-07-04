import pool from '../config/db.connection.js';

export const createLeaveTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS leave_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      leave_type ENUM('paid', 'sick', 'unpaid') NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      days_requested DECIMAL(5, 2) NOT NULL,
      remarks TEXT DEFAULT NULL,
      attachment_url VARCHAR(255) DEFAULT NULL,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      admin_comment TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  try {
    await pool.query(sql);
    console.log('Leave requests table initialized successfully');
  } catch (error) {
    console.error('Error creating leave requests table:', error.message);
    throw error;
  }
};

// ----- Query Helpers -----

// Insert a new leave request
export const insertLeaveRequest = async (leaveData) => {
  const { user_id, leave_type, start_date, end_date, days_requested, remarks, attachment_url } = leaveData;
  const sql = `
    INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, days_requested, remarks, attachment_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [user_id, leave_type, start_date, end_date, days_requested, remarks, attachment_url]);
  return result.insertId;
};

// Get dynamically calculated sum of approved leave days
export const getApprovedLeaveDaysSum = async (userId) => {
  const sql = `
    SELECT 
      COALESCE(SUM(CASE WHEN leave_type = 'paid' AND status = 'approved' THEN days_requested ELSE 0 END), 0) as approved_paid,
      COALESCE(SUM(CASE WHEN leave_type = 'sick' AND status = 'approved' THEN days_requested ELSE 0 END), 0) as approved_sick
    FROM leave_requests
    WHERE user_id = ?
  `;
  const [rows] = await pool.query(sql, [userId]);
  return rows[0] || { approved_paid: 0, approved_sick: 0 };
};

// Get personal leave requests history for an employee
export const getPersonalLeaves = async (userId) => {
  const sql = `
    SELECT id, leave_type, start_date, end_date, days_requested, remarks, attachment_url, status, admin_comment, created_at
    FROM leave_requests
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;
  const [rows] = await pool.query(sql, [userId]);
  return rows;
};

// Get all leave requests for admin dashboard
export const getAllLeaves = async () => {
  const sql = `
    SELECT 
      l.id, 
      l.user_id,
      u.first_name, 
      u.last_name, 
      u.employee_id,
      l.leave_type, 
      l.start_date, 
      l.end_date, 
      l.days_requested, 
      l.remarks, 
      l.attachment_url, 
      l.status, 
      l.admin_comment, 
      l.created_at
    FROM leave_requests l
    JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC
  `;
  const [rows] = await pool.query(sql);
  return rows;
};

// Fetch single leave request details
export const getLeaveRequestById = async (id) => {
  const sql = `SELECT * FROM leave_requests WHERE id = ?`;
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
};

// Update leave request status (approve/reject)
export const updateLeaveRequestStatus = async (id, status, adminComment) => {
  const sql = `
    UPDATE leave_requests
    SET status = ?, admin_comment = ?
    WHERE id = ?
  `;
  const [result] = await pool.query(sql, [status, adminComment, id]);
  return result.affectedRows > 0;
};

// Sync approved leave to attendances table by bulk inserting 'leave' status
export const bulkInsertAttendanceLeaves = async (userId, dates) => {
  if (!dates || dates.length === 0) return;

  // Insert or update on duplicate key (date, user_id)
  const sql = `
    INSERT INTO attendances (user_id, date, status)
    VALUES ?
    ON DUPLICATE KEY UPDATE status = 'leave'
  `;
  const values = dates.map(date => [userId, date, 'leave']);
  await pool.query(sql, [values]);
};

// Check if there is an overlapping leave request (pending or approved) for a user
export const hasOverlappingLeave = async (userId, startDate, endDate) => {
  const sql = `
    SELECT COUNT(*) as count 
    FROM leave_requests
    WHERE user_id = ? 
      AND status != 'rejected'
      AND start_date <= ? 
      AND end_date >= ?
  `;
  const [rows] = await pool.query(sql, [userId, endDate, startDate]);
  return rows[0].count > 0;
};

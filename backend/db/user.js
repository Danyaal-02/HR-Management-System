import pool from '../config/db.connection.js';

// Create the users table if it doesn't exist
export const createUserTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id VARCHAR(20) NOT NULL UNIQUE,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('employee', 'admin') NOT NULL DEFAULT 'employee',
      phone VARCHAR(20) DEFAULT NULL,
      address TEXT DEFAULT NULL,
      profile_picture VARCHAR(255) DEFAULT NULL,
      department VARCHAR(100) DEFAULT NULL,
      designation VARCHAR(100) DEFAULT NULL,
      date_of_joining DATE NOT NULL,
      is_password_changed TINYINT(1) NOT NULL DEFAULT 0,
      is_email_verified TINYINT(1) NOT NULL DEFAULT 0,
      email_verification_token VARCHAR(255) DEFAULT NULL,
      email_verification_expires DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(sql);
    console.log('Users table initialized successfully');
  } catch (error) {
    console.error('Error creating users table:', error.message);
    throw error;
  }
};

/**
 * Generate Employee ID
 * Format: OI + first2ofFirstName + first2ofLastName + joiningYear + 4-digit serial
 * Example: OIJODO20220001
 */
export const generateEmployeeId = async (firstName, lastName, dateOfJoining) => {
  const prefix = 'OI';
  const namePart = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase();
  const year = new Date(dateOfJoining).getFullYear();

  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM users WHERE YEAR(date_of_joining) = ?',
    [year]
  );

  const serialNo = String(rows[0].count + 1).padStart(4, '0');
  return `${prefix}${namePart}${year}${serialNo}`;
};

// ----- Query Helpers -----

export const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

export const findByEmployeeId = async (employeeId) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE employee_id = ?', [employeeId]);
  return rows[0] || null;
};

export const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

export const findByVerificationToken = async (token) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email_verification_token = ? AND email_verification_expires > NOW()',
    [token]
  );
  return rows[0] || null;
};

// Create a new user (called by Admin or during signup)
export const createUser = async (userData) => {
  const {
    employee_id,
    first_name,
    last_name,
    email,
    password,
    role = 'employee',
    phone = null,
    department = null,
    designation = null,
    date_of_joining,
    is_password_changed = 0,
    email_verification_token = null,
    email_verification_expires = null,
  } = userData;

  const sql = `
    INSERT INTO users 
      (employee_id, first_name, last_name, email, password, role, phone, department, designation, date_of_joining, is_password_changed, email_verification_token, email_verification_expires)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query(sql, [
    employee_id, first_name, last_name, email, password,
    role, phone, department, designation, date_of_joining,
    is_password_changed, email_verification_token, email_verification_expires,
  ]);

  return { id: result.insertId, employee_id, email, role };
};

export const updateUser = async (id, fieldsToUpdate) => {
  const keys = Object.keys(fieldsToUpdate);
  if (keys.length === 0) return null;

  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  const values = Object.values(fieldsToUpdate);

  const sql = `UPDATE users SET ${setClause} WHERE id = ?`;
  const [result] = await pool.query(sql, [...values, id]);

  return result.affectedRows > 0;
};

export const findAllUsers = async () => {
  const [rows] = await pool.query(
    'SELECT id, employee_id, first_name, last_name, email, role, phone, department, designation, date_of_joining, profile_picture, is_password_changed, is_email_verified, created_at FROM users'
  );
  return rows;
};

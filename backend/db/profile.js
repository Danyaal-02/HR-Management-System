import pool from '../config/db.connection.js';

export const createProfileTables = async () => {
  // 1. Employee Profiles table
  const profileSql = `
    CREATE TABLE IF NOT EXISTS employee_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      dob DATE DEFAULT NULL,
      residing_address TEXT DEFAULT NULL,
      nationality VARCHAR(50) DEFAULT NULL,
      personal_email VARCHAR(100) DEFAULT NULL,
      gender VARCHAR(20) DEFAULT NULL,
      marital_status VARCHAR(20) DEFAULT NULL,
      about TEXT DEFAULT NULL,
      interests_hobbies TEXT DEFAULT NULL,
      resume VARCHAR(255) DEFAULT NULL,
      account_number VARCHAR(50) DEFAULT NULL,
      bank_name VARCHAR(100) DEFAULT NULL,
      ifsc_code VARCHAR(20) DEFAULT NULL,
      pan_no VARCHAR(20) DEFAULT NULL,
      uan_no VARCHAR(20) DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  // 2. Employee Skills table
  const skillsSql = `
    CREATE TABLE IF NOT EXISTS employee_skills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      skill_name VARCHAR(100) NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  // 3. Employee Certifications table
  const certsSql = `
    CREATE TABLE IF NOT EXISTS employee_certifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      certification_name VARCHAR(150) NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  // 4. Employee Salaries table (Only visible to Admin)
  const salarySql = `
    CREATE TABLE IF NOT EXISTS employee_salaries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      month_wage DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      yearly_wage DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      working_days INT NOT NULL DEFAULT 5,
      basic_salary_type ENUM('fixed', 'percent') DEFAULT 'percent',
      basic_salary_value DECIMAL(12, 2) DEFAULT 50.00, -- 50% by default
      hra_type ENUM('fixed', 'percent') DEFAULT 'percent',
      hra_value DECIMAL(12, 2) DEFAULT 50.00, -- 50% of Basic by default
      standard_allowance DECIMAL(12, 2) DEFAULT 4167.00,
      performance_bonus_type ENUM('fixed', 'percent') DEFAULT 'percent',
      performance_bonus_value DECIMAL(12, 2) DEFAULT 8.33, -- 8.33% by default
      lta_type ENUM('fixed', 'percent') DEFAULT 'percent',
      lta_value DECIMAL(12, 2) DEFAULT 8.33, -- 8.33% by default
      fixed_allowance DECIMAL(12, 2) DEFAULT 0.00,
      pf_rate DECIMAL(5, 2) DEFAULT 12.00, -- 12% by default
      prof_tax DECIMAL(12, 2) DEFAULT 200.00, -- 200 by default
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  try {
    await pool.query(profileSql);
    await pool.query(skillsSql);
    await pool.query(certsSql);
    await pool.query(salarySql);
    console.log('Employee profile, skills, certifications, and salary tables initialized successfully');
  } catch (error) {
    console.error('Error creating profile tables:', error.message);
    throw error;
  }
};

// ----- Query Helpers -----

export const getProfileByUserId = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM employee_profiles WHERE user_id = ?', [userId]);
  return rows[0] || null;
};

export const createOrUpdateProfile = async (userId, data) => {
  // Check if profile exists
  const existing = await getProfileByUserId(userId);

  const fields = { ...data };
  const keys = Object.keys(fields);

  if (existing) {
    if (keys.length === 0) return true;
    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    const values = Object.values(fields);
    await pool.query(`UPDATE employee_profiles SET ${setClause} WHERE user_id = ?`, [...values, userId]);
  } else {
    keys.push('user_id');
    const placeholders = keys.map(() => '?').join(', ');
    const values = [...Object.values(fields), userId];
    await pool.query(`INSERT INTO employee_profiles (${keys.join(', ')}) VALUES (${placeholders})`, values);
  }
  return true;
};

export const getSkillsByUserId = async (userId) => {
  const [rows] = await pool.query('SELECT skill_name FROM employee_skills WHERE user_id = ?', [userId]);
  return rows.map((r) => r.skill_name);
};

export const setSkillsByUserId = async (userId, skills) => {
  // Delete all existing skills
  await pool.query('DELETE FROM employee_skills WHERE user_id = ?', [userId]);

  if (!skills || skills.length === 0) return true;

  // Bulk insert skills
  const values = skills.map((skill) => [userId, skill]);
  await pool.query('INSERT INTO employee_skills (user_id, skill_name) VALUES ?', [values]);
  return true;
};

export const getCertificationsByUserId = async (userId) => {
  const [rows] = await pool.query('SELECT certification_name FROM employee_certifications WHERE user_id = ?', [userId]);
  return rows.map((r) => r.certification_name);
};

export const setCertificationsByUserId = async (userId, certs) => {
  // Delete all existing certifications
  await pool.query('DELETE FROM employee_certifications WHERE user_id = ?', [userId]);

  if (!certs || certs.length === 0) return true;

  // Bulk insert certs
  const values = certs.map((cert) => [userId, cert]);
  await pool.query('INSERT INTO employee_certifications (user_id, certification_name) VALUES ?', [values]);
  return true;
};

export const getSalaryByUserId = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM employee_salaries WHERE user_id = ?', [userId]);
  return rows[0] || null;
};

export const createOrUpdateSalary = async (userId, salaryData) => {
  const existing = await getSalaryByUserId(userId);
  const fields = { ...salaryData };
  const keys = Object.keys(fields);

  if (existing) {
    if (keys.length === 0) return true;
    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    const values = Object.values(fields);
    await pool.query(`UPDATE employee_salaries SET ${setClause} WHERE user_id = ?`, [...values, userId]);
  } else {
    keys.push('user_id');
    const placeholders = keys.map(() => '?').join(', ');
    const values = [...Object.values(fields), userId];
    await pool.query(`INSERT INTO employee_salaries (${keys.join(', ')}) VALUES (${placeholders})`, values);
  }
  return true;
};

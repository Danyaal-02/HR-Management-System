import pool from '../config/db.connection.js';

export const createCompanyTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_name VARCHAR(100) NOT NULL,
      logo VARCHAR(255) DEFAULT NULL,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  try {
    await pool.query(sql);
    console.log('Companies table initialized successfully');
  } catch (error) {
    console.error('Error creating companies table:', error.message);
    throw error;
  }
};

export const createCompany = async ({ company_name, logo, created_by }) => {
  const sql = `INSERT INTO companies (company_name, logo, created_by) VALUES (?, ?, ?)`;
  const [result] = await pool.query(sql, [company_name, logo, created_by]);
  return { id: result.insertId, company_name };
};

export const getCompany = async () => {
  const [rows] = await pool.query('SELECT * FROM companies LIMIT 1');
  return rows[0] || null;
};

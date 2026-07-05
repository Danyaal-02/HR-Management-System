import "dotenv/config";
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import pool from '../config/db.connection.js';
import {
  DEPARTMENTS,
  DESIGNATIONS,
  SKILLS,
  CERTIFICATIONS,
  LEAVE_TYPES,
  LEAVE_STATUSES,
  ATTENDANCE_STATUSES,
} from './data.js';

const ADMIN_PASSWORD = 'Admin@123';
const HR_PASSWORD = 'Hr@123';
const MANAGER_PASSWORD = 'Manager@123';
const EMPLOYEE_PASSWORD = 'Employee@123';

const truncateTables = async () => {
  console.log('Truncating tables...');
  await pool.query('SET FOREIGN_KEY_CHECKS = 0;');
  const tables = [
    'users',
    'companies',
    'employee_profiles',
    'employee_skills',
    'employee_certifications',
    'employee_salaries',
    'attendances',
    'leave_requests',
    'payslips',
  ];
  for (const table of tables) {
    await pool.query(`TRUNCATE TABLE ${table};`);
  }
  await pool.query('SET FOREIGN_KEY_CHECKS = 1;');
  console.log('Tables truncated successfully.');
};

const seedDatabase = async () => {
  try {
    await truncateTables();

    console.log('Generating seed data...');
    const salt = await bcrypt.genSalt(12);

    // Pre-hash passwords
    const hashedAdminPwd = await bcrypt.hash(ADMIN_PASSWORD, salt);
    const hashedHrPwd = await bcrypt.hash(HR_PASSWORD, salt);
    const hashedManagerPwd = await bcrypt.hash(MANAGER_PASSWORD, salt);
    const hashedEmpPwd = await bcrypt.hash(EMPLOYEE_PASSWORD, salt);

    // 1. Create Company and Admin
    const [adminResult] = await pool.query(
      `INSERT INTO users (employee_id, first_name, last_name, email, password, role, phone, department, designation, date_of_joining, is_password_changed, is_email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      ['EMP-0001', 'Super', 'Admin', 'admin@example.com', hashedAdminPwd, 'admin', faker.string.numeric(10), 'Management', 'System Administrator', faker.date.past({ years: 5 }).toISOString().split('T')[0], 1, 1]
    );
    const adminId = adminResult.insertId;

    await pool.query(
      `INSERT INTO companies (company_name, created_by) VALUES (?, ?);`,
      ['Global Tech Solutions', adminId]
    );
    console.log(`✓ Admin created (admin@example.com)`);

    // Array to hold all user IDs for relationships
    const allUsers = [];
    let empCounter = 2;
    const generateEmpId = () => `EMP-${String(empCounter++).padStart(4, '0')}`;

    // Helper to insert user
    const insertUser = async (email, password, role, department, designation) => {
      const dateOfJoining = faker.date.past({ years: 4 }).toISOString().split('T')[0];
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      
      const [res] = await pool.query(
        `INSERT INTO users (employee_id, first_name, last_name, email, password, role, phone, address, department, designation, date_of_joining, is_password_changed, is_email_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [generateEmpId(), firstName, lastName, email, password, role, faker.string.numeric(10), faker.location.streetAddress(), department, designation, dateOfJoining, 1, 1]
      );
      
      const userId = res.insertId;
      allUsers.push(userId);

      // Create Profile
      await pool.query(
        `INSERT INTO employee_profiles (user_id, dob, residing_address, nationality, personal_email, gender, marital_status, about, account_number, bank_name, ifsc_code, pan_no)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          userId, 
          faker.date.birthdate({ min: 22, max: 60, mode: 'age' }).toISOString().split('T')[0], 
          faker.location.streetAddress(), 
          'American', 
          faker.internet.email(), 
          faker.helpers.arrayElement(['Male', 'Female']), 
          faker.helpers.arrayElement(['Single', 'Married']), 
          faker.lorem.paragraph(), 
          faker.finance.accountNumber(10), 
          faker.finance.accountName() + ' Bank', 
          'IFSC' + faker.string.numeric(7), 
          faker.string.alphanumeric({ length: 10, casing: 'upper' })
        ]
      );

      // Create Salary
      await pool.query(
        `INSERT INTO employee_salaries (user_id, month_wage, yearly_wage, working_days, basic_salary_type, basic_salary_value)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [userId, faker.number.int({ min: 3000, max: 15000 }), faker.number.int({ min: 36000, max: 180000 }), 5, 'percent', 50.00]
      );

      // Add Random Skills (2-5)
      const userSkills = faker.helpers.arrayElements(SKILLS, faker.number.int({ min: 2, max: 5 }));
      for (const skill of userSkills) {
        await pool.query(`INSERT INTO employee_skills (user_id, skill_name) VALUES (?, ?);`, [userId, skill]);
      }

      // Add Random Certifications (0-3)
      const userCerts = faker.helpers.arrayElements(CERTIFICATIONS, faker.number.int({ min: 0, max: 3 }));
      for (const cert of userCerts) {
        await pool.query(`INSERT INTO employee_certifications (user_id, certification_name) VALUES (?, ?);`, [userId, cert]);
      }
      
      return userId;
    };

    // 2. Create HRs
    for (let i = 1; i <= 3; i++) {
      await insertUser(`hr${i}@example.com`, hashedHrPwd, 'admin', 'Human Resources', 'HR Manager');
    }
    console.log(`✓ 3 HRs created`);

    // 3. Create Managers
    for (let i = 1; i <= 10; i++) {
      const dept = faker.helpers.arrayElement(DEPARTMENTS);
      await insertUser(`manager${i}@example.com`, hashedManagerPwd, 'employee', dept, 'Manager');
    }
    console.log(`✓ 10 Managers created`);

    // 4. Create Employees
    for (let i = 1; i <= 100; i++) {
      const dept = faker.helpers.arrayElement(DEPARTMENTS);
      const designation = faker.helpers.arrayElement(DESIGNATIONS[dept]);
      await insertUser(`employee${i}@example.com`, hashedEmpPwd, 'employee', dept, designation);
    }
    console.log(`✓ 100 Employees created`);

    // 5. Generate Attendances (Last 30 days for everyone)
    console.log('Generating attendance records...');
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const dateStr = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i).toISOString().split('T')[0];
      
      for (const uId of allUsers) {
        // Randomly skip some records to simulate missing attendance
        if (Math.random() > 0.95) continue; 
        
        const status = faker.helpers.arrayElement(ATTENDANCE_STATUSES);
        let checkIn = null;
        let checkOut = null;
        
        if (['present', 'half-day'].includes(status)) {
          // 09:00:00 to 10:00:00
          checkIn = `${faker.number.int({ min: 8, max: 10 }).toString().padStart(2, '0')}:${faker.number.int({ min: 0, max: 59 }).toString().padStart(2, '0')}:00`;
          // 17:00:00 to 19:00:00
          checkOut = `${faker.number.int({ min: 17, max: 19 }).toString().padStart(2, '0')}:${faker.number.int({ min: 0, max: 59 }).toString().padStart(2, '0')}:00`;
        }

        await pool.query(
          `INSERT INTO attendances (user_id, date, status, check_in, check_out) VALUES (?, ?, ?, ?, ?);`,
          [uId, dateStr, status, checkIn, checkOut]
        );
      }
    }
    console.log(`✓ Attendance records generated`);

    // 6. Generate Leave Requests
    console.log('Generating leave requests...');
    for (let i = 0; i < 80; i++) {
      const uId = faker.helpers.arrayElement(allUsers);
      const start = faker.date.recent({ days: 60 });
      const end = new Date(start);
      end.setDate(end.getDate() + faker.number.int({ min: 1, max: 5 }));
      
      await pool.query(
        `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, days_requested, remarks, status)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          uId,
          faker.helpers.arrayElement(LEAVE_TYPES),
          start.toISOString().split('T')[0],
          end.toISOString().split('T')[0],
          faker.number.int({ min: 1, max: 5 }),
          faker.lorem.sentence(),
          faker.helpers.arrayElement(LEAVE_STATUSES)
        ]
      );
    }
    console.log(`✓ 80 Leave Requests generated`);

    // 7. Generate Payslips
    console.log('Generating payslips...');
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    for (const uId of allUsers) {
      await pool.query(
        `INSERT INTO payslips (user_id, month, year, total_days, payable_days, unpaid_leaves, missing_attendance, base_month_wage, actual_month_wage, basic, hra, standard_allowance, performance_bonus, lta, fixed_allowance, pf_deduction, prof_tax, net_salary, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          uId, lastMonth, lastMonthYear, 30, 30, 0, 0, 5000, 5000, 2500, 1250, 4167, 416, 416, 0, 300, 200, 8249, 'paid'
        ]
      );
    }
    console.log(`✓ Payslips generated for previous month`);

    console.log('\n=============================================');
    console.log('✅ SEEDING COMPLETE!');
    console.log('=============================================');
    console.log('You can now log in with the following accounts:');
    console.log('1. Admin: admin@example.com / Admin@123');
    console.log('2. HR: hr1@example.com / Hr@123');
    console.log('3. Manager: manager1@example.com / Manager@123');
    console.log('4. Employee: employee1@example.com / Employee@123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

seedDatabase();

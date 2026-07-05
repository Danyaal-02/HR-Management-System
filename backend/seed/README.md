# Database Seed System

This seed system completely refreshes the database with realistic interconnected data using `@faker-js/faker`. It is designed to quickly populate the database so you can test all features of the HRMS application (pagination, charts, tables, searching) without manual data entry.

## How to Run

1. Navigate to the `backend` directory.
2. Ensure you have installed all dependencies, including dev dependencies (`npm install`).
3. Ensure your MySQL database is running and credentials in your `.env` file are correct.
4. Run the seed script:
   ```bash
   npm run seed
   ```
> [!WARNING]
> Running this script will TRUNCATE all existing tables and permanently delete all your existing data in the database. Use only in local or testing environments.

## Generated Data Summary

- **Users (Total 114)**
  - 1 Super Admin
  - 3 HR Managers (Admin Role)
  - 10 Managers (Employee Role)
  - 100 Regular Employees
- **Companies**: 1 Company linked to the Super Admin.
- **Profiles**: Personal details, banking info, 2-5 skills, and 0-3 certifications for each user.
- **Salaries**: Base salary structures for every user.
- **Attendance**: ~3,000 attendance logs spanning the last 30 days (simulating 95% attendance rates with random check-in/out times).
- **Leave Requests**: 80 random leave requests in varying states (Pending, Approved, Rejected).
- **Payslips**: 114 payslips generated for the previous month.

## Default Credentials

All generated accounts have verified emails and are active.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Admin@123` |
| HR Manager | `hr1@example.com` (up to hr3) | `Hr@123` |
| Manager | `manager1@example.com` (up to manager10) | `Manager@123` |
| Employee | `employee1@example.com` (up to employee100) | `Employee@123` |

## Assumptions Made
- Random times are strictly between 08:00 and 10:00 for check-ins and 17:00 and 19:00 for check-outs.
- Passwords are pre-hashed once and reused to speed up the massive insertion loops.
- `FOREIGN_KEY_CHECKS` are temporarily disabled during truncation to ensure a clean wipe without constraint errors.

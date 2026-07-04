# HRMS Backend - End-to-End Testing Guide

This guide provides a step-by-step walkthrough to test the complete Human Resource Management System (HRMS) backend API from scratch. It follows the exact logical order of operations a user (Admin/Employee) would perform.

---

## 1. Module Routes Summary

| Module | Route | Method | Access Level | Description |
|---|---|---|---|---|
| **Auth** | `/api/auth/signup` | POST | Public | Admin self-registration |
| | `/api/auth/verify/:token` | GET | Public | Verify email address |
| | `/api/auth/login` | POST | Public | Authenticate using Email or Employee ID |
| | `/api/auth/create-employee` | POST | Admin only | Register a new employee (generates temp password & ID) |
| | `/api/auth/change-password` | POST | Private | Force change password on first login |
| **Profile** | `/api/profile/:userId` | GET | Private | Get user profile, private info, skills, and salary |
| | `/api/profile/:userId` | PUT | Private | Update contact, skills, certifications, avatar, and resume |
| | `/api/profile/salary/:userId` | PUT | Admin only | Configure standard salary structures |
| | `/api/profile/list` | GET | Private | List all employees and their live status for grid |
| **Attendance**| `/api/attendance/check-in` | POST | Private | Daily check-in |
| | `/api/attendance/check-out` | POST | Private | Daily check-out & shift rules calculation |
| | `/api/attendance/my-logs` | GET | Private | View personal logs & stats (present, leave count) |
| | `/api/attendance/overview` | GET | Admin only | View all employee check-in logs for a date |
| **Leaves** | `/api/leave/apply` | POST | Private | Submit leave request (Medical cert attachment for sick) |
| | `/api/leave/my-leaves` | GET | Private | View personal requests history & leave balances |
| | `/api/leave/admin/requests` | GET | Admin only | View all employee leave applications |
| | `/api/leave/admin/approve/:id`| PUT | Admin only | Approve/Reject leave & sync to attendance logs |
| **Payroll** | `/api/payroll/overview` | GET | Admin only | Dry-run payable days & salary scaling calculations |
| | `/api/payroll/generate` | POST | Admin only | Calculate, generate, and store official monthly payslip |
| | `/api/payroll/my-payslips` | GET | Private | View generated payslips history (Employee view) |
| | `/api/payroll/payslip/:id` | GET | Private | View full breakdown details of a payslip |

---

## 2. Step-by-Step End-to-End Testing Flow

### Step 1: Register First Admin (Self-Registration)
* **Method:** `POST`
* **Route:** `http://localhost:5000/api/auth/signup`
* **Payload (JSON):**
  ```json
  {
    "company_name": "Google DeepMind",
    "first_name": "John",
    "last_name": "Doe",
    "email": "ign.fullmetal@gmail.com",
    "phone": "9876543210",
    "password": "Password123!"
  }
  ```
* **Expected Output (201 Created):**
  Returns success with a temporary `verification_token` inside the response data.

---

### Step 2: Verify Admin Email
* **Method:** `GET`
* **Route:** `http://localhost:5000/api/auth/verify/<PASTE_TOKEN_FROM_STEP_1>`
* **Expected Output (200 OK):**
  `"Email verified successfully. You can now login."`

---

### Step 3: Login as Admin
* **Method:** `POST`
* **Route:** `http://localhost:5000/api/auth/login`
* **Payload (JSON):**
  ```json
  {
    "login": "ign.fullmetal@gmail.com",
    "password": "Password123!"
  }
  ```
* **Expected Output (200 OK):**
  Returns the `token` (JWT). Save this token as `<ADMIN_JWT_TOKEN>`.

---

### Step 4: Admin Creates Employee Account
* **Method:** `POST`
* **Route:** `http://localhost:5000/api/auth/create-employee`
* **Headers:**
  * `Authorization`: `Bearer <ADMIN_JWT_TOKEN>`
* **Payload (JSON):**
  ```json
  {
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "9123456789",
    "department": "Engineering",
    "designation": "Developer",
    "date_of_joining": "2026-07-04"
  }
  ```
* **Expected Output (201 Created):**
  Generates a custom Employee ID (`employee_id` e.g., `"OIJASM20260002"`) and a temporary password (`temp_password` e.g., `"A1b*d3e4"`).

---

### Step 5: Employee Logs In (First Login)
* **Method:** `POST`
* **Route:** `http://localhost:5000/api/auth/login`
* **Payload (JSON):**
  ```json
  {
    "login": "jane.smith@example.com",
    "password": "A1b*d3e4"
  }
  ```
* **Expected Output (200 OK):**
  Returns a JWT token. Save this token as `<EMPLOYEE_JWT_TOKEN>`. The response shows `"is_password_changed": 0`, indicating that a password change is mandatory.

---

### Step 6: Employee Forces Password Change
* **Method:** `POST`
* **Route:** `http://localhost:5000/api/auth/change-password`
* **Headers:**
  * `Authorization`: `Bearer <EMPLOYEE_JWT_TOKEN>`
* **Payload (JSON):**
  ```json
  {
    "current_password": "A1b*d3e4",
    "new_password": "NewEmployeePassword123!"
  }
  ```
* **Expected Output (200 OK):**
  `"Password changed successfully"`

---

### Step 7: Employee Profile Update (Cloudinary Uploads)
* **Method:** `PUT`
* **Route:** `http://localhost:5000/api/profile/2` *(Replace 2 with the Employee User ID)*
* **Headers:**
  * `Authorization`: `Bearer <EMPLOYEE_JWT_TOKEN>`
* **Body (form-data):**
  * `personal_email` (text): `jane.personal@gmail.com`
  * `nationality` (text - ignored for employee): `Indian`
  * `skills` (text): `["Node.js", "Express", "MySQL"]`
  * `certifications` (text): `["AWS Certified Developer"]`
  * `profile_picture` (file): *[Choose an Image]*
  * `resume` (file): *[Choose a PDF]*
* **Expected Output (200 OK):**
  `"Profile updated successfully"`. The avatar is uploaded to `hrms/avatars` and the resume PDF to `hrms/resumes` on Cloudinary.

---

### Step 8: Configure Salary Structure (Admin Action)
* **Method:** `PUT`
* **Route:** `http://localhost:5000/api/profile/salary/2`
* **Headers:**
  * `Authorization`: `Bearer <ADMIN_JWT_TOKEN>`
* **Payload (JSON):**
  ```json
  {
    "month_wage": 50000,
    "working_days": 5
  }
  ```
* **Expected Output (200 OK):**
  Calculates and saves the standard salary breakdown structures.

---

### Step 9: Employee Check-In
* **Method:** `POST`
* **Route:** `http://localhost:5000/api/attendance/check-in`
* **Headers:**
  * `Authorization`: `Bearer <EMPLOYEE_JWT_TOKEN>`
* **Expected Output (201 Created):**
  `"Checked in successfully."`

---

### Step 10: Employee Check-Out (Calculates Hours)
* **Method:** `POST`
* **Route:** `http://localhost:5000/api/attendance/check-out`
* **Headers:**
  * `Authorization`: `Bearer <EMPLOYEE_JWT_TOKEN>`
* **Expected Output (200 OK):**
  Returns check-in time, check-out time, total work hours, and calculated status (`present` if >= 4.5 hrs, otherwise `half-day`).

---

### Step 11: Employee Requests Leave (Sick Leave Certificate required)
* **Method:** `POST`
* **Route:** `http://localhost:5000/api/leave/apply`
* **Headers:**
  * `Authorization`: `Bearer <EMPLOYEE_JWT_TOKEN>`
* **Body (form-data):**
  * `leave_type` (text): `Sick Leave`
  * `start_date` (text): `2026-07-06`
  * `end_date` (text): `2026-07-06`
  * `remarks` (text): `Medical rest`
  * `attachment` (file): *[Upload medical sheet image]*
* **Expected Output (201 Created):**
  `"Leave requested successfully."`

---

### Step 12: Admin Approves Leave Request (Syncs to Attendance)
* **Method:** `PUT`
* **Route:** `http://localhost:5000/api/leave/admin/approve/1` *(Replace 1 with the leave application ID)*
* **Headers:**
  * `Authorization`: `Bearer <ADMIN_JWT_TOKEN>`
* **Payload (JSON):**
  ```json
  {
    "status": "approved",
    "admin_comment": "Approved. Rest well."
  }
  ```
* **Expected Output (200 OK):**
  Updates leave status. The system automatically populates `'leave'` rows inside the `attendances` table for those dates.

---

### Step 13: Admin Reviews Monthly Payroll Preview (Dry-run preview)
* **Method:** `GET`
* **Route:** `http://localhost:5000/api/payroll/overview?month=7&year=2026`
* **Headers:**
  * `Authorization`: `Bearer <ADMIN_JWT_TOKEN>`
* **Expected Response (200 OK):**
  Calculates and returns dry-run metrics: payable days, unexcused absent days, unpaid leave days, base wage, actual wage, PF, and estimated net payout for all employees.

---

### Step 14: Admin Generates Employee Payslip
* **Method:** `POST`
* **Route:** `http://localhost:5000/api/payroll/generate`
* **Headers:**
  * `Authorization`: `Bearer <ADMIN_JWT_TOKEN>`
* **Payload (JSON):**
  ```json
  {
    "user_id": 2,
    "month": 7,
    "year": 2026
  }
  ```
* **Expected Output (201 Created):**
  Successfully generates, scales, and persists the employee's official payslip in the database.

---

### Step 15: Employee Views Generated Payslips
* **Method:** `GET`
* **Route:** `http://localhost:5000/api/payroll/my-payslips`
* **Headers:**
  * `Authorization`: `Bearer <EMPLOYEE_JWT_TOKEN>`
* **Expected Output (200 OK):**
  Lists all generated payslips for the employee.

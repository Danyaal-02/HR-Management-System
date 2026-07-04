# End-to-End API Test Document

This document lists the routes, inputs (headers, payloads, query parameters), and expected output responses for testing the complete Human Resource Management System (HRMS) backend.

---

## 1. Authentication System

### 1.1 Admin Self-Registration (Sign Up)
* **Route:** `POST /api/auth/signup`
* **Headers:** 
  * `Content-Type: application/json`
* **Body (raw JSON):**
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
* **Expected Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Account created successfully. Please verify your email.",
    "data": {
      "id": 1,
      "employee_id": "OIOI20260001",
      "email": "ign.fullmetal@gmail.com",
      "role": "admin",
      "verification_token": "a1b2c3d4..."
    }
  }
  ```

---

### 1.2 Verify Email Address
* **Route:** `GET /api/auth/verify/:token` (Replace token with verification_token from signup)
* **Headers:** None
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Email verified successfully. You can now login."
  }
  ```

---

### 1.3 Sign In (Admin or Employee)
* **Route:** `POST /api/auth/login`
* **Headers:**
  * `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "login": "ign.fullmetal@gmail.com", 
    "password": "Password123!"
  }
  ```
  *(Note: Employee ID e.g., `"OIJASM20260002"` can also be used as the value of `"login"`).*
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "employee_id": "OIOI20260001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "ign.fullmetal@gmail.com",
      "role": "admin",
      "is_password_changed": 1
    }
  }
  ```

---

### 1.4 Admin Creates Employee Account
* **Route:** `POST /api/auth/create-employee`
* **Headers:**
  * `Authorization: Bearer <ADMIN_JWT_TOKEN>`
  * `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "9123456789",
    "department": "Engineering",
    "designation": "Software Developer",
    "date_of_joining": "2026-07-04"
  }
  ```
* **Expected Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Employee created successfully",
    "data": {
      "id": 2,
      "employee_id": "OIJASM20260002",
      "email": "jane.smith@example.com",
      "role": "employee",
      "temp_password": "A1b*d3e4"
    }
  }
  ```

---

### 1.5 Employee Forces Password Change on First Login
* **Route:** `POST /api/auth/change-password`
* **Headers:**
  * `Authorization: Bearer <EMPLOYEE_JWT_TOKEN>`
  * `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "current_password": "A1b*d3e4",
    "new_password": "NewSecurePassword123!"
  }
  ```
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```

---

## 2. Employee Profile & Salary

### 2.1 Get Employee Profile
* **Route:** `GET /api/profile/:userId` (e.g., `/api/profile/2`)
* **Headers:**
  * `Authorization: Bearer <JWT_TOKEN>`
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 2,
        "employee_id": "OIJASM20260002",
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane.smith@example.com",
        "role": "employee",
        "phone": "9123456789",
        "department": "Engineering",
        "designation": "Software Developer",
        "date_of_joining": "2026-07-04T00:00:00.000Z",
        "profile_picture": null
      },
      "profile": null,
      "skills": [],
      "certifications": [],
      "salary": null
    }
  }
  ```

---

### 2.2 Update Employee Profile (Supports Cloudinary Uploads)
* **Route:** `PUT /api/profile/:userId` (e.g., `/api/profile/2`)
* **Headers:**
  * `Authorization: Bearer <EMPLOYEE_OR_ADMIN_TOKEN>`
* **Body (form-data):**
  * `personal_email` (text): `jane.personal@gmail.com`
  * `nationality` (text): `Indian`
  * `dob` (text - Admin only): `1995-05-15`
  * `marital_status` (text - Admin only): `Single`
  * `skills` (text): `["Node.js", "Express", "MySQL"]`
  * `certifications` (text): `["AWS Certified Developer"]`
  * `profile_picture` (file): *[Upload avatar image]*
  * `resume` (file): *[Upload resume PDF]*
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully"
  }
  ```
  *(Note: Non-admins trying to edit DOB/Nationality/Bank details will have those fields silently ignored).*

---

### 2.3 Configure Salary Structure (Admin Action)
* **Route:** `PUT /api/profile/salary/:userId` (e.g., `/api/profile/salary/2`)
* **Headers:**
  * `Authorization: Bearer <ADMIN_JWT_TOKEN>`
  * `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "month_wage": 50000
  }
  ```
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Salary details updated successfully",
    "data": {
      "month_wage": 50000,
      "yearly_wage": 600000,
      "basic_salary_value": 50,
      "hra_value": 50,
      "standard_allowance": 4167,
      "performance_bonus_value": 8.33,
      "lta_value": 8.33,
      "fixed_allowance": 2918.5,
      "pf_rate": 12,
      "prof_tax": 200,
      "calculated": {
        "basic": 25000,
        "hra": 12500,
        "standard_allowance": 4167,
        "performance_bonus": 4165,
        "lta": 4165,
        "fixed_allowance": 2918.5,
        "employee_pf": 3000,
        "employer_pf": 3000,
        "prof_tax": 200
      }
    }
  }
  ```

---

## 3. Attendance Management

### 3.1 Check-In (Log Start of Day)
* **Route:** `POST /api/attendance/check-in`
* **Headers:**
  * `Authorization: Bearer <EMPLOYEE_JWT_TOKEN>`
* **Expected Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Checked in successfully."
  }
  ```
  *Error Case (Already checked in today):*
  * **Status:** `400 Bad Request`
  * **Response:** `{ "success": false, "message": "You have already checked in today." }`

---

### 3.2 Check-Out (Log End of Day & Calculate Shift Hours)
* **Route:** `POST /api/attendance/check-out`
* **Headers:**
  * `Authorization: Bearer <EMPLOYEE_JWT_TOKEN>`
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Checked out successfully.",
    "data": {
      "check_in": "09:00:00",
      "check_out": "18:00:00",
      "work_hours": 9.00,
      "extra_hours": 1.00,
      "status": "present"
    }
  }
  ```
  *(Note: Status is calculated as `present` if work_hours >= 4.5, otherwise `half-day`).*

---

### 3.3 Get Personal Attendance History & Summary
* **Route:** `GET /api/attendance/my-logs?start_date=2026-07-01&end_date=2026-07-31`
* **Headers:**
  * `Authorization: Bearer <EMPLOYEE_JWT_TOKEN>`
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "summary": {
      "days_present": 1,
      "days_leave": 0,
      "total_working_days": 1
    },
    "data": [
      {
        "date": "2026-07-04",
        "check_in": "09:00:00",
        "check_out": "18:00:00",
        "status": "present",
        "work_hours": 9,
        "extra_hours": 1
      }
    ]
  }
  ```

---

### 3.4 Get Daily Attendance Overview (Admin Only)
* **Route:** `GET /api/attendance/overview?date=2026-07-04`
* **Headers:**
  * `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "user_id": 2,
        "employee_id": "OIJASM20260002",
        "first_name": "Jane",
        "last_name": "Smith",
        "department": "Engineering",
        "designation": "Software Developer",
        "check_in": "09:00:00",
        "check_out": "18:00:00",
        "status": "present",
        "work_hours": 9,
        "extra_hours": 1
      }
    ]
  }
  ```

---

## 4. Leave & Time-Off Management

### 4.1 Apply for Leave
* **Route:** `POST /api/leave/apply`
* **Headers:**
  * `Authorization: Bearer <EMPLOYEE_JWT_TOKEN>`
* **Body (form-data):**
  * `leave_type` (text): `Paid Time Off` *(accepts: Paid Time Off / Sick Leave / Unpaid Leaves)*
  * `start_date` (text): `2026-07-06`
  * `end_date` (text): `2026-07-07`
  * `remarks` (text): `Personal work`
  * `attachment` (file - Required for Sick Leave only): *[Medical certificate]*
* **Expected Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Leave requested successfully."
  }
  ```
  *Error Case (Overlapping dates request):*
  * **Status:** `400 Bad Request`
  * **Response:** `{ "success": false, "message": "You have already applied for leave during these dates." }`

---

### 4.2 Get Personal Leave Requests and Available Balances
* **Route:** `GET /api/leave/my-leaves`
* **Headers:**
  * `Authorization: Bearer <EMPLOYEE_JWT_TOKEN>`
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "balances": {
      "paid": 24,
      "sick": 7
    },
    "leaves": [
      {
        "id": 1,
        "leave_type": "paid",
        "start_date": "2026-07-06",
        "end_date": "2026-07-07",
        "days_requested": 2,
        "remarks": "Personal work",
        "attachment_url": null,
        "status": "pending",
        "admin_comment": null,
        "created_at": "2026-07-04T08:15:00.000Z"
      }
    ]
  }
  ```

---

### 4.3 View All Employee Leave Requests (Admin Only)
* **Route:** `GET /api/leave/admin/requests`
* **Headers:**
  * `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "user_id": 2,
        "first_name": "Jane",
        "last_name": "Smith",
        "employee_id": "OIJASM20260002",
        "leave_type": "paid",
        "start_date": "2026-07-06",
        "end_date": "2026-07-07",
        "days_requested": 2,
        "remarks": "Personal work",
        "attachment_url": null,
        "status": "pending",
        "admin_comment": null,
        "created_at": "2026-07-04T08:15:00.000Z"
      }
    ]
  }
  ```

---

### 4.4 Approve or Reject Leave Request (Admin Action)
* **Route:** `PUT /api/leave/admin/approve/:id` (e.g., `/api/leave/admin/approve/1`)
* **Headers:**
  * `Authorization: Bearer <ADMIN_JWT_TOKEN>`
  * `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "status": "approved",
    "admin_comment": "Approved. Stay safe."
  }
  ```
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Leave request status updated successfully."
  }
  ```
  *(Upon approval, Paid leave balance will drop to `22` and attendance records for `2026-07-06` and `2026-07-07` will be marked as `"leave"` status automatically).*

---

## 5. Payroll & Payslip Management

### 5.1 Get Payroll Monthly Preview (Admin Only)
* **Route:** `GET /api/payroll/overview?month=7&year=2026`
* **Headers:**
  * `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 2,
        "employee_id": "OIJASM20260002",
        "first_name": "Jane",
        "last_name": "Smith",
        "department": "Engineering",
        "designation": "Software Developer",
        "has_salary_structure": true,
        "payroll": {
          "user_id": 2,
          "month": 7,
          "year": 2026,
          "total_days": 31,
          "payable_days": 28,
          "unpaid_leaves": 2,
          "missing_attendance": 1,
          "base_month_wage": 50000,
          "actual_month_wage": 45161.29,
          "basic": 22580.65,
          "hra": 11290.32,
          "standard_allowance": 3762.58,
          "performance_bonus": 3761.94,
          "lta": 3761.94,
          "fixed_allowance": 0,
          "pf_deduction": 2709.68,
          "prof_tax": 200,
          "net_salary": 42251.61
        }
      }
    ]
  }
  ```

---

### 5.2 Generate and Store Payslip (Admin Action)
* **Route:** `POST /api/payroll/generate`
* **Headers:**
  * `Authorization: Bearer <ADMIN_JWT_TOKEN>`
  * `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "user_id": 2,
    "month": 7,
    "year": 2026
  }
  ```
* **Expected Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Payslip generated successfully.",
    "data": {
      "user_id": 2,
      "month": 7,
      "year": 2026,
      "total_days": 31,
      "payable_days": 28,
      "unpaid_leaves": 2,
      "missing_attendance": 1,
      "base_month_wage": 50000,
      "actual_month_wage": 45161.29,
      "basic": 22580.65,
      "hra": 11290.32,
      "standard_allowance": 3762.58,
      "performance_bonus": 3761.94,
      "lta": 3761.94,
      "fixed_allowance": 0,
      "pf_deduction": 2709.68,
      "prof_tax": 200,
      "net_salary": 42251.61
    }
  }
  ```

---

### 5.3 Get My Payslips List (Employee View)
* **Route:** `GET /api/payroll/my-payslips`
* **Headers:**
  * `Authorization: Bearer <EMPLOYEE_JWT_TOKEN>`
* **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "month": 7,
        "year": 2026,
        "payable_days": 28,
        "base_month_wage": 50000,
        "actual_month_wage": 45161.29,
        "net_salary": 42251.61,
        "status": "generated",
        "created_at": "2026-07-04T09:39:00.000Z"
      }
    ]
  }
  ```

---

### 5.4 Get Individual Payslip Details
* **Route:** `GET /api/payroll/payslip/1` (Replace 1 with target payslip ID)
* **Headers:**
  * `Authorization`: `Bearer <EMPLOYEE_OR_ADMIN_TOKEN>`
* **Expected Response (200 OK):** Returns complete detailed payroll breakdown along with Designation, Department, and Date of Joining details.

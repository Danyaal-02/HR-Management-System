export const AUTH_MESSAGES = {
  EMAIL_REGISTERED: 'Email is already registered',
  EMPLOYEE_ID_EXISTS: 'Employee ID already exists',
  INVALID_CREDENTIALS: 'Invalid credentials',
  EMAIL_VERIFY_PENDING: 'Please verify your email before logging in',
  ACCOUNT_CREATED_VERIFY: 'Account created successfully. Please verify your email.',
  EMAIL_VERIFIED: 'Email verified successfully. You can now login.',
  LOGIN_SUCCESS: 'Login successful',
  EMPLOYEE_CREATED: 'Employee created successfully',
  PASSWORD_INCORRECT: 'Current password is incorrect',
  PASSWORD_CHANGED: 'Password changed successfully',
  NOT_AUTHORIZED_NO_TOKEN: 'Not authorized, no token provided',
  USER_NOT_FOUND: 'User not found',
  NOT_AUTHORIZED_INVALID_TOKEN: 'Not authorized, token invalid',
  ROLE_NOT_AUTHORIZED: (role) => `Role '${role}' is not authorized to access this route`,
  INVALID_VERIFY_TOKEN: 'Invalid or expired verification token',
};

export const PROFILE_MESSAGES = {
  ACCESS_DENIED_VIEW: 'Access denied. You can only view your own profile.',
  ACCESS_DENIED_EDIT: 'Access denied. You can only edit your own profile.',
  USER_NOT_FOUND: 'User not found',
  PROFILE_UPDATED: 'Profile updated successfully',
  MONTH_WAGE_REQUIRED: 'Month wage is required',
  SALARY_UPDATED: 'Salary details updated successfully',
};

export const COMMON_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  VALIDATION_FAILED: 'Validation failed',
};

export const ATTENDANCE_MESSAGES = {
  ALREADY_CHECKED_IN: 'You have already checked in today.',
  CHECK_IN_SUCCESS: 'Checked in successfully.',
  NOT_CHECKED_IN_TODAY: 'You have not checked in today yet.',
  ALREADY_CHECKED_OUT: 'You have already checked out today.',
  CHECK_OUT_SUCCESS: 'Checked out successfully.',
  INVALID_DATE_RANGE: 'Invalid date range.',
};

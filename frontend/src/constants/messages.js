export const TOAST_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Logged in successfully',
    LOGOUT: 'Logged out successfully',
    SIGNUP: 'Account created successfully',
    EMAIL_VERIFIED: 'Email verified successfully! You can now log in.',
    PASSWORD_CHANGED: 'Password changed successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    SKILL_ADDED: 'Skill added successfully',
    SKILL_DELETED: 'Skill deleted successfully',
    CERT_ADDED: 'Certification added successfully',
    CERT_DELETED: 'Certification deleted successfully',
    AVATAR_UPLOADED: 'Avatar uploaded successfully',
    LEAVE_APPLIED: 'Leave requested successfully',
    LEAVE_CANCELLED: 'Leave request cancelled',
    LEAVE_STATUS_UPDATED: 'Leave request status updated',
    CHECK_IN: 'Checked in successfully',
    CHECK_OUT: 'Checked out successfully',
    EMPLOYEE_CREATED: 'Employee created successfully',
  },
  ERROR: {
    DEFAULT: 'An error occurred. Please try again.',
    UNAUTHORIZED: 'Session expired. Please log in again.',
    NETWORK: 'Network error. Please check your connection.',
    INVALID_DATES: 'Invalid date range selected',
    REQUIRED_FIELDS: 'Please fill in all required fields',
  },
};

export const CONFIRMATION_MESSAGES = {
  CANCEL_LEAVE: {
    TITLE: 'Cancel Leave Request',
    MESSAGE: 'Are you sure you want to cancel this leave request? This action cannot be undone.',
    CONFIRM_TEXT: 'Yes, Cancel Leave',
    CANCEL_TEXT: 'No, Keep It',
  },
  DELETE_SKILL: {
    TITLE: 'Remove Skill',
    MESSAGE: 'Are you sure you want to remove this skill?',
    CONFIRM_TEXT: 'Remove',
    CANCEL_TEXT: 'Cancel',
  },
  DELETE_CERT: {
    TITLE: 'Remove Certification',
    MESSAGE: 'Are you sure you want to remove this certification?',
    CONFIRM_TEXT: 'Remove',
    CANCEL_TEXT: 'Cancel',
  },
  LOGOUT: {
    TITLE: 'Logout',
    MESSAGE: 'Are you sure you want to logout?',
    CONFIRM_TEXT: 'Logout',
    CANCEL_TEXT: 'Cancel',
  }
};

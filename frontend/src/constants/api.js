export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    CHANGE_PASSWORD: '/auth/change-password',
    CREATE_EMPLOYEE: '/auth/create-employee',
    VERIFY_EMAIL: (token) => `/auth/verify-email/${token}`,
  },
  PROFILE: {
    BY_ID: (id) => `/profile/${id}`,
    SALARY: (id) => `/profile/salary/${id}`,
    LIST: '/profile/list',
  },
  LEAVE: {
    APPLY: '/leave/apply',
    MY_LEAVES: '/leave/my-leaves',
    CANCEL: (id) => `/leave/cancel/${id}`,
    ALL: '/leave/admin/requests',
    UPDATE_STATUS: (id) => `/leave/admin/approve/${id}`,
  },
  ATTENDANCE: {
    CHECK_IN: '/attendance/check-in',
    CHECK_OUT: '/attendance/check-out',
    MY_LOGS: '/attendance/my-logs',
    OVERVIEW: '/attendance/overview',
  },
};

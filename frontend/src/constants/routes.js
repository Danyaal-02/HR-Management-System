export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  MY_PROFILE: '/my-profile',
  EMPLOYEE_PROFILE: (id) => `/employee/${id}`,
  ATTENDANCE: '/attendance',
  TIME_OFF: '/timeoff',
};

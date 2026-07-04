import apiClient from './apiClient'

/**
 * POST /api/auth/signup
 * Body: { company_name, first_name, last_name, email, phone, password, confirm_password }
 */
export const signupFn = async (data) => {
  const res = await apiClient.post('/auth/signup', data)
  return res.data
}

/**
 * POST /api/auth/login
 * Body: { login_id, password }
 */
export const loginFn = async (data) => {
  const res = await apiClient.post('/auth/login', data)
  return res.data
}

/**
 * PUT /api/auth/change-password
 * Body: { current_password, new_password }
 */
export const changePasswordFn = async (data) => {
  const res = await apiClient.put('/auth/change-password', data)
  return res.data
}

/**
 * POST /api/auth/create-employee  (admin only)
 * Body: { first_name, last_name, email, phone, department, designation, date_of_joining }
 */
export const createEmployeeFn = async (data) => {
  const res = await apiClient.post('/auth/create-employee', data)
  return res.data
}

/**
 * GET /api/auth/verify-email/:token
 */
export const verifyEmailFn = async (token) => {
  const res = await apiClient.get(`/auth/verify-email/${token}`)
  return res.data
}


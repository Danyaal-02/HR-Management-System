import apiClient from '../../../lib/apiClient'
import { API_ENDPOINTS } from '../../../constants'
/**
 * POST /api/auth/signup
 * Body: { company_name, first_name, last_name, email, phone, password, confirm_password }
 */
export const signupFn = async (data) => {
  const res = await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, data)
  return res.data
}

/**
 * POST /api/auth/login
 * Body: { login_id, password }
 */
export const loginFn = async (data) => {
  const res = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data)
  return res.data
}

/**
 * PUT /api/auth/change-password
 * Body: { current_password, new_password }
 */
export const changePasswordFn = async (data) => {
  const res = await apiClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data)
  return res.data
}

/**
 * POST /api/auth/create-employee  (admin only)
 * Body: { first_name, last_name, email, phone, department, designation, date_of_joining }
 */
export const createEmployeeFn = async (data) => {
  const res = await apiClient.post(API_ENDPOINTS.AUTH.CREATE_EMPLOYEE, data)
  return res.data
}

/**
 * GET /api/auth/verify-email/:token
 */
export const verifyEmailFn = async (token) => {
  const res = await apiClient.get(API_ENDPOINTS.AUTH.VERIFY_EMAIL(token))
  return res.data
}


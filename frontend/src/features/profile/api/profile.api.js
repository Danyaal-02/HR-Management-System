import apiClient from '../../../lib/apiClient'
import { API_ENDPOINTS } from '../../../constants'

/**
 * GET /api/profile/:userId
 */
export const getProfileFn = async (userId) => {
  const res = await apiClient.get(API_ENDPOINTS.PROFILE.BY_ID(userId))
  return res.data
}

/**
 * PUT /api/profile/:userId  — form-data (supports file upload)
 */
export const updateProfileFn = async ({ userId, formData }) => {
  const res = await apiClient.put(API_ENDPOINTS.PROFILE.BY_ID(userId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

/**
 * PUT /api/profile/salary/:userId  (admin only)
 * Body: { month_wage }
 */
export const updateSalaryFn = async ({ userId, data }) => {
  const res = await apiClient.put(API_ENDPOINTS.PROFILE.SALARY(userId), data)
  return res.data
}

/**
 * GET /api/profile/list  — dashboard employee list
 */
export const getDashboardEmployeesFn = async (params = {}) => {
  const res = await apiClient.get(API_ENDPOINTS.PROFILE.LIST, { params })
  return res.data
}

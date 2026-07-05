import apiClient from '../../../lib/apiClient'
import { API_ENDPOINTS } from '../../../constants'
/**
 * POST /api/leave/apply  — multipart for optional attachment
 * Body (FormData): leave_type, start_date, end_date, remarks, attachment?
 */
export const applyLeaveFn = async (formData) => {
  const res = await apiClient.post(API_ENDPOINTS.LEAVE.APPLY, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

/**
 * GET /api/leave/my-leaves
 */
export const getMyLeavesFn = async (params = {}) => {
  const res = await apiClient.get(API_ENDPOINTS.LEAVE.MY_LEAVES, { params })
  return res.data
}

/**
 * GET /api/leave/admin/requests  (admin only)
 */
export const getAdminLeavesFn = async (params = {}) => {
  const res = await apiClient.get(API_ENDPOINTS.LEAVE.ALL, { params })
  return res.data
}

/**
 * PUT /api/leave/admin/approve/:id  (admin only)
 * Body: { status: 'approved' | 'rejected', admin_comment? }
 */
export const approveOrRejectLeaveFn = async ({ id, status, admin_comment }) => {
  const res = await apiClient.put(API_ENDPOINTS.LEAVE.UPDATE_STATUS(id), {
    status,
    admin_comment,
  })
  return res.data
}

/**
 * PUT /api/leave/cancel/:id
 */
export const cancelLeaveFn = async (id) => {
  const res = await apiClient.put(API_ENDPOINTS.LEAVE.CANCEL(id))
  return res.data
}

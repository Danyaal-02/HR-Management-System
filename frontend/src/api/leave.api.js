import apiClient from './apiClient'

/**
 * POST /api/leave/apply  — multipart for optional attachment
 * Body (FormData): leave_type, start_date, end_date, remarks, attachment?
 */
export const applyLeaveFn = async (formData) => {
  const res = await apiClient.post('/leave/apply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

/**
 * GET /api/leave/my-leaves
 */
export const getMyLeavesFn = async () => {
  const res = await apiClient.get('/leave/my-leaves')
  return res.data
}

/**
 * GET /api/leave/admin/requests  (admin only)
 */
export const getAdminLeavesFn = async () => {
  const res = await apiClient.get('/leave/admin/requests')
  return res.data
}

/**
 * PUT /api/leave/admin/approve/:id  (admin only)
 * Body: { status: 'approved' | 'rejected', admin_comment? }
 */
export const approveOrRejectLeaveFn = async ({ id, status, admin_comment }) => {
  const res = await apiClient.put(`/leave/admin/approve/${id}`, { status, admin_comment })
  return res.data
}

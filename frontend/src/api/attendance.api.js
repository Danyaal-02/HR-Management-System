import apiClient from './apiClient'

/**
 * POST /api/attendance/check-in
 */
export const checkInFn = async () => {
  const res = await apiClient.post('/attendance/check-in')
  return res.data
}

/**
 * POST /api/attendance/check-out
 */
export const checkOutFn = async () => {
  const res = await apiClient.post('/attendance/check-out')
  return res.data
}

/**
 * GET /api/attendance/my-logs?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 */
export const getMyAttendanceFn = async ({ startDate, endDate }) => {
  const res = await apiClient.get('/attendance/my-logs', {
    params: { start_date: startDate, end_date: endDate },
  })
  return res.data
}

/**
 * GET /api/attendance/overview?date=YYYY-MM-DD  (admin only)
 */
export const getAdminAttendanceOverviewFn = async (date) => {
  const res = await apiClient.get('/attendance/overview', {
    params: { date },
  })
  return res.data
}

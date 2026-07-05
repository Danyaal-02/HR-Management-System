import apiClient from '../../../lib/apiClient'
import { API_ENDPOINTS } from '../../../constants'

/**
 * POST /api/attendance/check-in
 */
export const checkInFn = async () => {
  const res = await apiClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_IN)
  return res.data
}

/**
 * POST /api/attendance/check-out
 */
export const checkOutFn = async () => {
  const res = await apiClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_OUT)
  return res.data
}

/**
 * GET /api/attendance/my-logs?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
 */
export const getMyAttendanceFn = async ({ startDate, endDate, page, limit, sortBy, sortDir }) => {
  const res = await apiClient.get(API_ENDPOINTS.ATTENDANCE.MY_LOGS, {
    params: { start_date: startDate, end_date: endDate, page, limit, sortBy, sortDir },
  })
  return res.data
}

/**
 * GET /api/attendance/overview?date=YYYY-MM-DD  (admin only)
 */
export const getAdminAttendanceOverviewFn = async ({ date, search, page, limit, sortBy, sortDir }) => {
  const res = await apiClient.get(API_ENDPOINTS.ATTENDANCE.OVERVIEW, {
    params: { date, search, page, limit, sortBy, sortDir },
  })
  return res.data
}

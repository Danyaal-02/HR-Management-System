import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  checkInFn,
  checkOutFn,
  getMyAttendanceFn,
  getAdminAttendanceOverviewFn,
} from '../api/attendance.api'

export const MY_ATTENDANCE_KEY = (startDate, endDate) => [
  'attendance',
  'my-logs',
  startDate,
  endDate,
]
export const ADMIN_OVERVIEW_KEY = (date) => ['attendance', 'overview', date]
export const DASHBOARD_EMPLOYEES_KEY = ['dashboard', 'employees']

/**
 * Fetch personal attendance history for a date range.
 */
export const useMyAttendance = ({ startDate, endDate }, options = {}) => {
  return useQuery({
    queryKey: MY_ATTENDANCE_KEY(startDate, endDate),
    queryFn: () => getMyAttendanceFn({ startDate, endDate }),
    enabled: !!(startDate && endDate),
    ...options,
  })
}

/**
 * Fetch admin attendance overview for a specific date.
 */
export const useAdminAttendanceOverview = (date, options = {}) => {
  return useQuery({
    queryKey: ADMIN_OVERVIEW_KEY(date),
    queryFn: () => getAdminAttendanceOverviewFn(date),
    enabled: !!date,
    ...options,
  })
}

/**
 * Check-in mutation.
 * Invalidates the dashboard employees list so status refreshes.
 */
export const useCheckIn = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: checkInFn,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_EMPLOYEES_KEY })
      options.onSuccess?.(...args)
    },
    ...options,
  })
}

/**
 * Check-out mutation.
 * Invalidates the dashboard employees list so status refreshes.
 */
export const useCheckOut = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: checkOutFn,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_EMPLOYEES_KEY })
      options.onSuccess?.(...args)
    },
    ...options,
  })
}

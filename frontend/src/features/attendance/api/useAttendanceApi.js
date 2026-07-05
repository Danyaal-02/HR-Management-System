import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import {
  checkInFn,
  checkOutFn,
  getMyAttendanceFn,
  getAdminAttendanceOverviewFn,
} from './attendance.api'
import { QUERY_KEYS } from '../../../constants'

export const MY_ATTENDANCE_KEY = (params) => [
  QUERY_KEYS.MY_ATTENDANCE,
  params,
]
export const ADMIN_OVERVIEW_KEY = (params) => [QUERY_KEYS.ADMIN_ATTENDANCE, params]
export const DASHBOARD_EMPLOYEES_KEY = ['dashboard', 'employees']

/**
 * Fetch personal attendance history for a date range.
 */
export const useMyAttendance = (params, options = {}) => {
  return useInfiniteQuery({
    queryKey: MY_ATTENDANCE_KEY(params),
    queryFn: ({ pageParam = 1 }) => getMyAttendanceFn({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination && lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!(params?.startDate && params?.endDate),
    ...options,
  })
}

/**
 * Fetch admin attendance overview for a specific date.
 */
export const useAdminAttendanceOverview = (params, options = {}) => {
  return useInfiniteQuery({
    queryKey: ADMIN_OVERVIEW_KEY(params),
    queryFn: ({ pageParam = 1 }) => getAdminAttendanceOverviewFn({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination && lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!params?.date,
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

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import {
  getProfileFn,
  updateProfileFn,
  updateSalaryFn,
  getDashboardEmployeesFn,
} from './profile.api'
import { QUERY_KEYS } from '../../../constants'

export const PROFILE_KEY = (userId) => [QUERY_KEYS.EMPLOYEE_PROFILE, userId]
export const DASHBOARD_EMPLOYEES_KEY = [QUERY_KEYS.EMPLOYEES]

/**
 * Fetch a user's profile by ID.
 * Enabled only when userId is truthy.
 */
export const useProfile = (userId, options = {}) => {
  return useQuery({
    queryKey: PROFILE_KEY(userId),
    queryFn: () => getProfileFn(userId),
    enabled: !!userId,
    ...options,
  })
}

/**
 * Update a user's profile (supports multipart/form-data).
 * Invalidates the profile query on success.
 */
export const useUpdateProfile = (userId, options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData) => updateProfileFn({ userId, formData }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY(userId) })
      options.onSuccess?.(...args)
    },
    ...options,
  })
}

/**
 * Update salary structure for an employee (admin only).
 */
export const useUpdateSalary = (userId, options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => updateSalaryFn({ userId, data }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY(userId) })
      options.onSuccess?.(...args)
    },
    ...options,
  })
}

/**
 * Fetch all employees for the dashboard list (with today's attendance status).
 */
export const useDashboardEmployees = (params = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: [...DASHBOARD_EMPLOYEES_KEY, params],
    queryFn: ({ pageParam = 1 }) => getDashboardEmployeesFn({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination && lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    ...options,
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProfileFn,
  updateProfileFn,
  updateSalaryFn,
  getDashboardEmployeesFn,
} from '../api/profile.api'

export const PROFILE_KEY = (userId) => ['profile', userId]
export const DASHBOARD_EMPLOYEES_KEY = ['dashboard', 'employees']

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
export const useDashboardEmployees = (options = {}) => {
  return useQuery({
    queryKey: DASHBOARD_EMPLOYEES_KEY,
    queryFn: getDashboardEmployeesFn,
    ...options,
  })
}

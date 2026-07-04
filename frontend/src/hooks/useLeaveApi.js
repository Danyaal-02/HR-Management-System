import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  applyLeaveFn,
  getMyLeavesFn,
  getAdminLeavesFn,
  approveOrRejectLeaveFn,
} from '../api/leave.api'

export const MY_LEAVES_KEY = ['leaves', 'my-leaves']
export const ADMIN_LEAVES_KEY = ['leaves', 'admin-requests']

/**
 * Fetch current employee's leaves and balances.
 */
export const useMyLeaves = (options = {}) => {
  return useQuery({
    queryKey: MY_LEAVES_KEY,
    queryFn: getMyLeavesFn,
    ...options,
  })
}

/**
 * Apply for leave mutation.
 * Accepts a FormData object (supports optional file attachment).
 */
export const useApplyLeave = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: applyLeaveFn,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: MY_LEAVES_KEY })
      options.onSuccess?.(...args)
    },
    ...options,
  })
}

/**
 * Fetch all employee leave requests (admin only).
 */
export const useAdminLeaves = (options = {}) => {
  return useQuery({
    queryKey: ADMIN_LEAVES_KEY,
    queryFn: getAdminLeavesFn,
    ...options,
  })
}

/**
 * Approve or reject a leave request (admin only).
 * Invalidates both admin and employee leave caches.
 */
export const useApproveOrRejectLeave = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: approveOrRejectLeaveFn,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_LEAVES_KEY })
      queryClient.invalidateQueries({ queryKey: MY_LEAVES_KEY })
      options.onSuccess?.(...args)
    },
    ...options,
  })
}

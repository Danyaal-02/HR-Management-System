import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import {
  applyLeaveFn,
  getMyLeavesFn,
  getAdminLeavesFn,
  approveOrRejectLeaveFn,
  cancelLeaveFn,
} from './leave.api'
import { QUERY_KEYS } from '../../../constants'

export const MY_LEAVES_KEY = (params) => [QUERY_KEYS.MY_LEAVES, params]
export const ADMIN_LEAVES_KEY = (params) => [QUERY_KEYS.ALL_LEAVES, params]

/**
 * Fetch current employee's leaves and balances.
 */
export const useMyLeaves = (params = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: MY_LEAVES_KEY(params),
    queryFn: ({ pageParam = 1 }) => getMyLeavesFn({ ...params, page: pageParam }),
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

/**
 * Apply for leave mutation.
 * Invalidates the base leave cache so the lists refresh.
 */
export const useApplyLeave = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: applyLeaveFn,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_LEAVES] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_LEAVES] })
      options.onSuccess?.(...args)
    },
    ...options,
  })
}

/**
 * Fetch all employee leave requests (admin only).
 */
export const useAdminLeaves = (params = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: ADMIN_LEAVES_KEY(params),
    queryFn: ({ pageParam = 1 }) => getAdminLeavesFn({ ...params, page: pageParam }),
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

/**
 * Approve or reject a leave request (admin only).
 * Invalidates both admin and employee leave caches.
 */
export const useApproveOrRejectLeave = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: approveOrRejectLeaveFn,
    onMutate: async (updatedLeave) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.ALL_LEAVES] })
      const previousLeaves = queryClient.getQueriesData({ queryKey: [QUERY_KEYS.ALL_LEAVES] })

      queryClient.setQueriesData({ queryKey: [QUERY_KEYS.ALL_LEAVES] }, (oldData) => {
        if (!oldData || !oldData.pages) return oldData
        
        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            const dataArray = page.rows || page.data || page.leaves || []
            const updatedArray = dataArray.map((leave) => {
              if (leave.id === updatedLeave.id) {
                return {
                  ...leave,
                  status: updatedLeave.status,
                  admin_comment: updatedLeave.admin_comment || leave.admin_comment,
                }
              }
              return leave
            })
            return {
              ...page,
              ...(page.rows && { rows: updatedArray }),
              ...(page.data && { data: updatedArray }),
              ...(page.leaves && { leaves: updatedArray }),
            }
          }),
        }
      })

      return { previousLeaves }
    },
    onError: (err, newLeave, context) => {
      if (context?.previousLeaves) {
        context.previousLeaves.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData)
        })
      }
      if (options.onError) options.onError(err, newLeave, context)
    },
    onSettled: (...args) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_LEAVES] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_LEAVES] })
      if (options.onSettled) options.onSettled(...args)
    },
    onSuccess: (...args) => {
      if (options.onSuccess) options.onSuccess(...args)
    },
  })
}

/**
 * Cancel a leave request (employee only).
 * Invalidates employee leave cache.
 */
export const useCancelLeave = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelLeaveFn,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.MY_LEAVES] })
      const previousLeaves = queryClient.getQueriesData({ queryKey: [QUERY_KEYS.MY_LEAVES] })

      queryClient.setQueriesData({ queryKey: [QUERY_KEYS.MY_LEAVES] }, (oldData) => {
        if (!oldData || !oldData.pages) return oldData
        
        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            const dataArray = page.rows || page.data || page.leaves || []
            const updatedArray = dataArray.map((leave) => {
              if (leave.id === id) {
                return {
                  ...leave,
                  status: 'cancelled',
                }
              }
              return leave
            })
            return {
              ...page,
              ...(page.rows && { rows: updatedArray }),
              ...(page.data && { data: updatedArray }),
              ...(page.leaves && { leaves: updatedArray }),
            }
          }),
        }
      })

      return { previousLeaves }
    },
    onError: (err, newLeave, context) => {
      if (context?.previousLeaves) {
        context.previousLeaves.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData)
        })
      }
      if (options.onError) options.onError(err, newLeave, context)
    },
    onSettled: (...args) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_LEAVES] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_LEAVES] })
      if (options.onSettled) options.onSettled(...args)
    },
    onSuccess: (...args) => {
      if (options.onSuccess) options.onSuccess(...args)
    },
  })
}

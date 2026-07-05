import { useMutation } from '@tanstack/react-query'
import {
  signupFn,
  loginFn,
  changePasswordFn,
  createEmployeeFn,
  verifyEmailFn,
} from './auth.api'
import { TOAST_MESSAGES } from '../../../constants'

/**
 * Login mutation.
 * On success the caller is responsible for storing token + user in localStorage
 * and updating AuthContext.
 */
export const useLogin = (options = {}) => {
  return useMutation({
    mutationFn: loginFn,
    ...options,
  })
}

/**
 * Admin self-registration mutation.
 */
export const useSignup = (options = {}) => {
  return useMutation({
    mutationFn: signupFn,
    ...options,
  })
}

/**
 * Change password mutation (requires auth).
 */
export const useChangePassword = (options = {}) => {
  return useMutation({
    mutationFn: changePasswordFn,
    ...options,
  })
}

/**
 * Admin creates employee mutation.
 */
export const useCreateEmployee = (options = {}) => {
  return useMutation({
    mutationFn: createEmployeeFn,
    ...options,
  })
}

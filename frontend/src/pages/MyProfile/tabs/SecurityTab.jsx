import { useState } from 'react'
import { useChangePassword } from '../../../hooks/useAuthApi'

function SecurityTab() {
  const changePasswordMutation = useChangePassword()

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setSuccessMsg('')
      return
    }

    changePasswordMutation.mutate(
      { current_password: formData.currentPassword, new_password: formData.newPassword },
      {
        onSuccess: (res) => {
          if (res.success) {
            setSuccessMsg('Password updated successfully!')
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setErrors({})
          }
        },
        onError: (err) => {
          const msg = err?.response?.data?.message || 'Failed to update password.'
          setErrors({ currentPassword: msg })
        },
      }
    )
  }

  return (
    <div className="animate-tab-fade-in pt-4 flex justify-center py-6">
      <form
        onSubmit={handleSubmit}
        className="bg-bg-card border border-border-color rounded-lg p-8 w-full max-w-[480px]"
        id="password-change-form"
      >
        <h3 className="text-[1.25rem] text-text-primary mb-1.5 font-bold">Change Password</h3>
        <p className="text-[0.85rem] text-text-secondary mb-6">
          Update your login password regularly to keep your account secure.
        </p>

        {successMsg && (
          <div className="bg-status-success/10 text-status-success p-3 rounded-md border border-status-success/20 mb-5 text-[0.88rem] text-center">{successMsg}</div>
        )}

        <div className="flex flex-col gap-5 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.82rem] font-semibold text-text-secondary uppercase tracking-wide" htmlFor="sec-current-password">
              Current Password
            </label>
            <div
              className={`group relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 h-12 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] ${errors.currentPassword ? '!border-status-error !focus-within:border-status-error !focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
            >
              <svg
                className="text-text-muted shrink-0 mr-3 transition-colors duration-200 group-focus-within:text-primary-purple"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="sec-current-password"
                type={showCurrent ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className="flex-1 bg-transparent border-none text-text-primary text-[0.92rem] h-full focus:outline-none placeholder-text-muted"
              />
              <button
                type="button"
                className="flex items-center justify-center bg-transparent text-text-muted p-1 rounded-sm text-xs font-semibold transition-all duration-200 hover:text-text-primary hover:bg-white/5"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.currentPassword && (
              <span className="text-[0.78rem] text-status-error flex items-center gap-1 mt-1 pl-1">
                {errors.currentPassword}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.82rem] font-semibold text-text-secondary uppercase tracking-wide" htmlFor="sec-new-password">
              New Password
            </label>
            <div
              className={`group relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 h-12 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] ${errors.newPassword ? '!border-status-error !focus-within:border-status-error !focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
            >
              <svg
                className="text-text-muted shrink-0 mr-3 transition-colors duration-200 group-focus-within:text-primary-purple"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="sec-new-password"
                type={showNew ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="flex-1 bg-transparent border-none text-text-primary text-[0.92rem] h-full focus:outline-none placeholder-text-muted"
              />
              <button
                type="button"
                className="flex items-center justify-center bg-transparent text-text-muted p-1 rounded-sm text-xs font-semibold transition-all duration-200 hover:text-text-primary hover:bg-white/5"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.newPassword && (
              <span className="text-[0.78rem] text-status-error flex items-center gap-1 mt-1 pl-1">{errors.newPassword}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.82rem] font-semibold text-text-secondary uppercase tracking-wide" htmlFor="sec-confirm-password">
              Confirm New Password
            </label>
            <div
              className={`group relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 h-12 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] ${errors.confirmPassword ? '!border-status-error !focus-within:border-status-error !focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
            >
              <svg
                className="text-text-muted shrink-0 mr-3 transition-colors duration-200 group-focus-within:text-primary-purple"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="sec-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="flex-1 bg-transparent border-none text-text-primary text-[0.92rem] h-full focus:outline-none placeholder-text-muted"
              />
              <button
                type="button"
                className="flex items-center justify-center bg-transparent text-text-muted p-1 rounded-sm text-xs font-semibold transition-all duration-200 hover:text-text-primary hover:bg-white/5"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-[0.78rem] text-status-error flex items-center gap-1 mt-1 pl-1">
                {errors.confirmPassword}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-12 bg-gradient-primary hover:bg-gradient-hover text-white text-[0.95rem] font-bold tracking-wider rounded-md flex items-center justify-center transition-all duration-300 shadow-button hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 uppercase mt-3"
          id="sec-submit-btn"
          disabled={changePasswordMutation.isPending}
        >
          {changePasswordMutation.isPending ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}

export default SecurityTab

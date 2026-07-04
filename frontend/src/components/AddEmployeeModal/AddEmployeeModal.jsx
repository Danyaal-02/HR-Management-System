import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './AddEmployeeModal.css'

function AddEmployeeModal({ isOpen, onClose }) {
  const { addEmployee } = useAuth()
  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    password: '',
    role: 'Employee',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    setSuccessMessage('')
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSuccessMessage('')
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    // Simulate brief loading
    setTimeout(() => {
      const result = addEmployee(formData)
      setIsLoading(false)

      if (result.success) {
        setSuccessMessage(
          `Employee "${result.employee.id}" added successfully!`
        )
        setFormData({
          employeeId: '',
          email: '',
          password: '',
          role: 'Employee',
        })
        setErrors({})
        // Auto-close after short delay
        setTimeout(() => {
          setSuccessMessage('')
          onClose()
        }, 1500)
      } else {
        setErrors({ submit: result.error })
      }
    }, 500)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="add-emp-overlay"
      onClick={handleOverlayClick}
      id="add-employee-modal-overlay"
    >
      <div className="add-emp-modal" id="add-employee-modal">
        {/* Close button */}
        <button
          type="button"
          className="add-emp-modal__close"
          onClick={onClose}
          aria-label="Close modal"
          id="add-employee-close-btn"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="add-emp-modal__header">
          <div className="add-emp-modal__icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h2 className="add-emp-modal__title">Add New Employee</h2>
          <p className="add-emp-modal__subtitle">
            Fill in the details to create a new employee account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="add-emp-form">
          {/* Employee ID */}
          <div className="add-emp-field">
            <label className="add-emp-field__label" htmlFor="add-emp-id">
              Employee ID
            </label>
            <div
              className={`add-emp-field__input-wrapper ${errors.employeeId ? 'add-emp-field__input-wrapper--error' : ''}`}
            >
              <svg
                className="add-emp-field__icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M7 10h4M7 14h6" />
                <circle cx="17" cy="12" r="2" />
              </svg>
              <input
                type="text"
                id="add-emp-id"
                name="employeeId"
                placeholder="e.g. OIAB20260005"
                value={formData.employeeId}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            {errors.employeeId && (
              <span className="add-emp-field__error">{errors.employeeId}</span>
            )}
          </div>

          {/* Email */}
          <div className="add-emp-field">
            <label className="add-emp-field__label" htmlFor="add-emp-email">
              Email
            </label>
            <div
              className={`add-emp-field__input-wrapper ${errors.email ? 'add-emp-field__input-wrapper--error' : ''}`}
            >
              <svg
                className="add-emp-field__icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                id="add-emp-email"
                name="email"
                placeholder="employee@company.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            {errors.email && (
              <span className="add-emp-field__error">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="add-emp-field">
            <label className="add-emp-field__label" htmlFor="add-emp-password">
              Password
            </label>
            <div
              className={`add-emp-field__input-wrapper ${errors.password ? 'add-emp-field__input-wrapper--error' : ''}`}
            >
              <svg
                className="add-emp-field__icon"
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
                type={showPassword ? 'text' : 'password'}
                id="add-emp-password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="add-emp-field__toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                id="add-emp-toggle-password"
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="add-emp-field__error">{errors.password}</span>
            )}
          </div>

          {/* Role */}
          <div className="add-emp-field">
            <label className="add-emp-field__label" htmlFor="add-emp-role">
              Role
            </label>
            <div className="add-emp-role-options">
              <button
                type="button"
                className={`add-emp-role-btn ${formData.role === 'Employee' ? 'add-emp-role-btn--active' : ''}`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, role: 'Employee' }))
                }
                id="add-emp-role-employee"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Employee
              </button>
              <button
                type="button"
                className={`add-emp-role-btn ${formData.role === 'HR' ? 'add-emp-role-btn--active' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, role: 'HR' }))}
                id="add-emp-role-admin"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Admin
              </button>
            </div>
          </div>

          {/* Error / Success messages */}
          {errors.submit && (
            <div className="add-emp-message add-emp-message--error">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {errors.submit}
            </div>
          )}

          {successMessage && (
            <div className="add-emp-message add-emp-message--success">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {successMessage}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className={`add-emp-submit ${isLoading ? 'add-emp-submit--loading' : ''}`}
            disabled={isLoading}
            id="add-employee-submit-btn"
          >
            {isLoading ? (
              <span className="add-emp-spinner"></span>
            ) : (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Employee
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddEmployeeModal

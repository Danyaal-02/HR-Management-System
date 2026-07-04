import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './SignIn.css'

function SignIn() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.loginId.trim()) {
      newErrors.loginId = 'Login ID or Email is required'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setIsLoading(true)

    // Simulate minor network delay
    setTimeout(() => {
      const res = login(formData.loginId, formData.password)
      setIsLoading(false)
      if (res.success) {
        navigate('/dashboard')
      } else {
        setErrors({ loginId: res.error })
      }
    }, 800)
  }

  return (
    <div className="auth-page">
      {/* Animated background elements */}
      <div className="auth-bg-effects">
        <div className="auth-bg-orb auth-bg-orb--1"></div>
        <div className="auth-bg-orb auth-bg-orb--2"></div>
        <div className="auth-bg-orb auth-bg-orb--3"></div>
        <div className="auth-bg-grid"></div>
      </div>

      <div className="auth-container">
        {/* Left branding panel */}
        <div className="auth-branding">
          <div className="auth-branding__content">
            <div className="auth-branding__icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect
                  width="48"
                  height="48"
                  rx="12"
                  fill="url(#logo-gradient)"
                />
                <path
                  d="M14 16h8v4h-8v-4zm0 8h20v4H14v-4zm0 8h16v4H14v-4zm12-16h8v4h-8v-4z"
                  fill="white"
                  fillOpacity="0.9"
                />
                <defs>
                  <linearGradient
                    id="logo-gradient"
                    x1="0"
                    y1="0"
                    x2="48"
                    y2="48"
                  >
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="auth-branding__title">HRMS</h1>
            <p className="auth-branding__subtitle">
              Human Resource Management System
            </p>
            <p className="auth-branding__tagline">
              Every workday, perfectly aligned.
            </p>

            <div className="auth-branding__features">
              <div className="auth-branding__feature">
                <span className="auth-branding__feature-icon">👥</span>
                <span>Employee Management</span>
              </div>
              <div className="auth-branding__feature">
                <span className="auth-branding__feature-icon">📊</span>
                <span>Attendance Tracking</span>
              </div>
              <div className="auth-branding__feature">
                <span className="auth-branding__feature-icon">📋</span>
                <span>Leave Management</span>
              </div>
              <div className="auth-branding__feature">
                <span className="auth-branding__feature-icon">💰</span>
                <span>Payroll Visibility</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="auth-form-wrapper">
          <form className="auth-form" onSubmit={handleSubmit} id="signin-form">
            <div className="auth-form__header">
              <div className="auth-form__logo-mobile">
                <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                  <rect
                    width="48"
                    height="48"
                    rx="12"
                    fill="url(#logo-gradient-mobile)"
                  />
                  <path
                    d="M14 16h8v4h-8v-4zm0 8h20v4H14v-4zm0 8h16v4H14v-4zm12-16h8v4h-8v-4z"
                    fill="white"
                    fillOpacity="0.9"
                  />
                  <defs>
                    <linearGradient
                      id="logo-gradient-mobile"
                      x1="0"
                      y1="0"
                      x2="48"
                      y2="48"
                    >
                      <stop stopColor="#a855f7" />
                      <stop offset="1" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                </svg>
                <span>HRMS</span>
              </div>
              <h2 className="auth-form__title">Sign In</h2>
              <p className="auth-form__description">
                Welcome back! Please enter your credentials.
              </p>
            </div>

            <div className="auth-form__fields">
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="signin-loginId">
                  Login ID / Email
                </label>
                <div
                  className={`auth-field__input-wrapper ${errors.loginId ? 'auth-field__input-wrapper--error' : ''}`}
                >
                  <svg
                    className="auth-field__icon"
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
                  <input
                    type="text"
                    id="signin-loginId"
                    name="loginId"
                    placeholder="Enter your Login ID or Email"
                    value={formData.loginId}
                    onChange={handleChange}
                    autoComplete="username"
                  />
                </div>
                {errors.loginId && (
                  <span className="auth-field__error">{errors.loginId}</span>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-field__label" htmlFor="signin-password">
                  Password
                </label>
                <div
                  className={`auth-field__input-wrapper ${errors.password ? 'auth-field__input-wrapper--error' : ''}`}
                >
                  <svg
                    className="auth-field__icon"
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
                    id="signin-password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-field__toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    id="signin-toggle-password"
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
                  <span className="auth-field__error">{errors.password}</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className={`auth-form__submit ${isLoading ? 'auth-form__submit--loading' : ''}`}
              disabled={isLoading}
              id="signin-submit-btn"
            >
              {isLoading ? (
                <span className="auth-form__spinner"></span>
              ) : (
                'SIGN IN'
              )}
            </button>

            <p className="auth-form__footer">
              Don&apos;t have an account?{' '}
              <Link
                to="/sign-up"
                className="auth-form__link"
                id="signin-goto-signup"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignIn

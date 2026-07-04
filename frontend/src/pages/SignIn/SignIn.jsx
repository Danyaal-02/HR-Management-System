import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLogin } from '../../hooks/useAuthApi'

function SignIn() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const loginMutation = useLogin()

  const [formData, setFormData] = useState({ loginId: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.loginId.trim()) newErrors.loginId = 'Login ID or Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    loginMutation.mutate(
      { login_id: formData.loginId, password: formData.password },
      {
        onSuccess: (res) => {
          if (res.success) {
            const { token, ...userData } = res.data
            login(userData, token)

            // Force password change on first login
            if (userData.must_change_password) {
              navigate('/my-profile')
            } else {
              navigate('/dashboard')
            }
          }
        },
        onError: (err) => {
          const msg =
            err?.response?.data?.message || 'Login failed. Please try again.'
          setErrors({ loginId: msg })
        },
      }
    )
  }

  const isLoading = loginMutation.isPending

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center relative overflow-hidden p-5">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full blur-[80px] opacity-40 animate-pulse w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(168,85,247,0.3),transparent_70%)] -top-[100px] -right-[100px]"></div>
        <div className="absolute rounded-full blur-[80px] opacity-40 animate-pulse w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(217,70,239,0.25),transparent_70%)] -bottom-[80px] -left-[80px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[900px] min-h-[550px] bg-bg-card/70 backdrop-blur-md border border-white/10 rounded-2xl flex overflow-hidden shadow-card md:flex-row flex-col max-md:max-w-[440px] max-md:min-h-0">
        {/* Left branding panel */}
        <div className="flex-1 md:flex hidden flex-col items-center justify-center p-12 bg-gradient-to-br from-primary-purple/8 to-primary-pink/5 border-r border-border-color/30 relative overflow-hidden">
          <div className="relative z-10 text-center">
            <div className="mb-5 inline-block">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="url(#logo-gradient)" />
                <path
                  d="M14 16h8v4h-8v-4zm0 8h20v4H14v-4zm0 8h16v4H14v-4zm12-16h8v4h-8v-4z"
                  fill="white"
                  fillOpacity="0.9"
                />
                <defs>
                  <linearGradient id="logo-gradient" x1="0" y1="0" x2="48" y2="48">
                    <stop stopColor="#a855f7" />
                    <stop offset="1" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="text-[2.2rem] font-extrabold bg-gradient-primary bg-clip-text text-transparent tracking-tight mb-1.5">HRMS</h1>
            <p className="text-[0.85rem] text-text-secondary font-medium mb-1">Human Resource Management System</p>
            <p className="text-[0.8rem] text-text-muted italic mb-8">Every workday, perfectly aligned.</p>

            <div className="flex flex-col gap-3 text-left w-full max-w-[280px] mx-auto">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-primary-purple/6 border border-primary-purple/10 rounded-md text-[0.85rem] text-text-secondary transition-all duration-300 hover:bg-primary-purple/10 hover:border-primary-purple/20 hover:text-text-primary hover:translate-x-1">
                <span className="text-[1.1rem]">👥</span>
                <span>Employee Management</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-primary-purple/6 border border-primary-purple/10 rounded-md text-[0.85rem] text-text-secondary transition-all duration-300 hover:bg-primary-purple/10 hover:border-primary-purple/20 hover:text-text-primary hover:translate-x-1">
                <span className="text-[1.1rem]">📊</span>
                <span>Attendance Tracking</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-primary-purple/6 border border-primary-purple/10 rounded-md text-[0.85rem] text-text-secondary transition-all duration-300 hover:bg-primary-purple/10 hover:border-primary-purple/20 hover:text-text-primary hover:translate-x-1">
                <span className="text-[1.1rem]">📋</span>
                <span>Leave Management</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-primary-purple/6 border border-primary-purple/10 rounded-md text-[0.85rem] text-text-secondary transition-all duration-300 hover:bg-primary-purple/10 hover:border-primary-purple/20 hover:text-text-primary hover:translate-x-1">
                <span className="text-[1.1rem]">💰</span>
                <span>Payroll Visibility</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="flex-1 flex items-center justify-center p-12 max-md:p-8 max-sm:p-5">
          <form className="w-full max-w-[380px]" onSubmit={handleSubmit} id="signin-form">
            <div className="mb-8 text-center max-md:mb-6">
              <div className="md:hidden flex items-center justify-center gap-2.5 mb-5 text-xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">
                <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                  <rect width="48" height="48" rx="12" fill="url(#logo-gradient-mobile)" />
                  <path
                    d="M14 16h8v4h-8v-4zm0 8h20v4H14v-4zm0 8h16v4H14v-4zm12-16h8v4h-8v-4z"
                    fill="white"
                    fillOpacity="0.9"
                  />
                  <defs>
                    <linearGradient id="logo-gradient-mobile" x1="0" y1="0" x2="48" y2="48">
                      <stop stopColor="#a855f7" />
                      <stop offset="1" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                </svg>
                <span>HRMS</span>
              </div>
              <h2 className="text-[1.75rem] font-bold text-text-primary mb-2">Sign In</h2>
              <p className="text-[0.9rem] text-text-secondary">
                Welcome back! Please enter your credentials.
              </p>
            </div>

            <div className="flex flex-col gap-5 mb-7">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary tracking-wide uppercase" htmlFor="signin-loginId">
                  Login ID / Email
                </label>
                <div
                  className={`group/input relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 h-12 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] ${errors.loginId ? 'border-status-error! focus-within:border-status-error! focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]!' : ''}`}
                >
                  <svg className="text-text-muted shrink-0 mr-3 transition-colors duration-200 group-focus-within/input:text-primary-purple" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    className="flex-1 bg-transparent border-none text-text-primary text-[0.92rem] h-full focus:outline-none placeholder-text-muted"
                  />
                </div>
                {errors.loginId && (
                  <span className="text-[0.78rem] text-status-error flex items-center gap-1 mt-1 pl-1">{errors.loginId}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary tracking-wide uppercase" htmlFor="signin-password">
                  Password
                </label>
                <div
                  className={`group/input relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 h-12 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] ${errors.password ? 'border-status-error! focus-within:border-status-error! focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]!' : ''}`}
                >
                  <svg className="text-text-muted shrink-0 mr-3 transition-colors duration-200 group-focus-within/input:text-primary-purple" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    className="flex-1 bg-transparent border-none text-text-primary text-[0.92rem] h-full focus:outline-none placeholder-text-muted"
                  />
                  <button
                    type="button"
                    className="flex items-center justify-center bg-transparent text-text-muted p-1 rounded-sm transition-all duration-200 hover:text-text-primary hover:bg-white/5"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    id="signin-toggle-password"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-[0.78rem] text-status-error flex items-center gap-1 mt-1 pl-1">{errors.password}</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-gradient-primary hover:bg-gradient-hover text-white text-[0.95rem] font-bold tracking-wider rounded-md flex items-center justify-center transition-all duration-300 shadow-button hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 uppercase relative overflow-hidden"
              disabled={isLoading}
              id="signin-submit-btn"
            >
              {isLoading ? <span className="w-[22px] h-[22px] border-[2.5px] border-white/30 border-t-white rounded-full animate-spin"></span> : 'SIGN IN'}
            </button>

            <p className="text-center mt-6 text-[0.88rem] text-text-secondary">
              Don&apos;t have an account?{' '}
              <Link to="/sign-up" className="text-text-link font-semibold transition-colors duration-200 hover:text-text-link-hover relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-primary after:transition-all after:duration-300 hover:after:w-full" id="signin-goto-signup">
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

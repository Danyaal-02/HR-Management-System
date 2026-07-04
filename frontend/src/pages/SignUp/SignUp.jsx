import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignup } from '../../hooks/useAuthApi'

function SignUp() {
  const navigate = useNavigate()
  const signupMutation = useSignup()

  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  // eslint-disable-next-line no-unused-vars
  const [companyLogo, setCompanyLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, logo: 'Logo must be less than 2MB' }))
        return
      }
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, logo: 'Please upload an image file' }))
        return
      }
      setCompanyLogo(file)
      setErrors((prev) => ({ ...prev, logo: '' }))
      const reader = new FileReader()
      reader.onload = (event) => setLogoPreview(event.target.result)
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setCompanyLogo(null)
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required'
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(formData.password)) {
      newErrors.password = 'Must include uppercase, lowercase, number & special character'
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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

    signupMutation.mutate(
      {
        company_name: formData.companyName,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            setSuccessMsg(
              res.message ||
                'Account created! Please check your email to verify your account before signing in.'
            )
          }
        },
        onError: (err) => {
          const msg =
            err?.response?.data?.message || 'Sign up failed. Please try again.'
          setErrors({ email: msg })
        },
      }
    )
  }

  const isLoading = signupMutation.isPending

  // Show success message after signup
  if (successMsg) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center relative overflow-hidden p-5">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute rounded-full blur-[80px] opacity-40 animate-pulse w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(168,85,247,0.3),transparent_70%)] -top-[100px] -right-[100px]"></div>
          <div className="absolute rounded-full blur-[80px] opacity-40 animate-pulse w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(217,70,239,0.25),transparent_70%)] -bottom-[80px] -left-[80px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        </div>
        <div className="relative z-10 w-full max-w-[900px] min-h-[550px] bg-bg-card/70 backdrop-blur-md border border-white/10 rounded-2xl flex overflow-hidden shadow-card md:flex-row flex-col max-md:max-w-[440px] max-md:min-h-0">
          <div className="flex-1 md:flex hidden flex-col items-center justify-center p-12 bg-gradient-to-br from-primary-purple/8 to-primary-pink/5 border-r border-border-color/30 relative overflow-hidden">
            <div className="relative z-10 text-center">
              <div className="mb-5 inline-block">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect width="48" height="48" rx="12" fill="url(#logo-gradient-success)" />
                  <path d="M14 16h8v4h-8v-4zm0 8h20v4H14v-4zm0 8h16v4H14v-4zm12-16h8v4h-8v-4z" fill="white" fillOpacity="0.9" />
                  <defs>
                    <linearGradient id="logo-gradient-success" x1="0" y1="0" x2="48" y2="48">
                      <stop stopColor="#a855f7" />
                      <stop offset="1" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h1 className="text-[2.2rem] font-extrabold bg-gradient-primary bg-clip-text text-transparent tracking-tight mb-1.5">HRMS</h1>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-12 max-md:p-8 max-sm:p-5">
            <div className="w-full max-w-[380px] flex flex-col items-center text-center gap-6">
              <div className="text-5xl">✉️</div>
              <h2 className="text-[1.75rem] font-bold text-text-primary">Check Your Email</h2>
              <p className="text-[0.9rem] text-text-secondary">{successMsg}</p>
              <button
                className="w-full h-12 bg-gradient-primary hover:bg-gradient-hover text-white text-[0.95rem] font-bold tracking-wider rounded-md flex items-center justify-center transition-all duration-300 shadow-button hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 uppercase relative overflow-hidden"
                onClick={() => navigate('/sign-in')}
                id="signup-goto-signin-after-verify"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center relative overflow-hidden p-5">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full blur-[80px] opacity-40 animate-pulse w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(168,85,247,0.3),transparent_70%)] -top-[100px] -right-[100px]"></div>
        <div className="absolute rounded-full blur-[80px] opacity-40 animate-pulse w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(217,70,239,0.25),transparent_70%)] -bottom-[80px] -left-[80px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1000px] bg-bg-card/70 backdrop-blur-md border border-white/10 rounded-2xl flex overflow-hidden shadow-card md:flex-row flex-col max-md:max-w-[440px] max-md:min-h-0">
        {/* Left branding panel */}
        <div className="flex-1 md:flex hidden flex-col items-center justify-center p-12 bg-gradient-to-br from-primary-purple/8 to-primary-pink/5 border-r border-border-color/30 relative overflow-hidden">
          <div className="relative z-10 text-center">
            <div className="mb-5 inline-block">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="url(#logo-gradient-su)" />
                <path d="M14 16h8v4h-8v-4zm0 8h20v4H14v-4zm0 8h16v4H14v-4zm12-16h8v4h-8v-4z" fill="white" fillOpacity="0.9" />
                <defs>
                  <linearGradient id="logo-gradient-su" x1="0" y1="0" x2="48" y2="48">
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

        {/* Sign Up Form */}
        <div className="flex-1 flex items-center justify-center p-12 max-md:p-8 max-sm:p-5">
          <form className="w-full max-w-[420px]" onSubmit={handleSubmit} id="signup-form">
            <div className="mb-8 text-center max-md:mb-6">
              <div className="md:hidden flex items-center justify-center gap-2.5 mb-5 text-xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">
                <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                  <rect width="48" height="48" rx="12" fill="url(#logo-gradient-su-mobile)" />
                  <path d="M14 16h8v4h-8v-4zm0 8h20v4H14v-4zm0 8h16v4H14v-4zm12-16h8v4h-8v-4z" fill="white" fillOpacity="0.9" />
                  <defs>
                    <linearGradient id="logo-gradient-su-mobile" x1="0" y1="0" x2="48" y2="48">
                      <stop stopColor="#a855f7" />
                      <stop offset="1" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                </svg>
                <span>HRMS</span>
              </div>
              <h2 className="text-[1.75rem] font-bold text-text-primary mb-2">Sign Up</h2>
              <p className="text-[0.9rem] text-text-secondary">Create your organization account to get started.</p>
            </div>

            <div className="flex flex-col gap-5 mb-7">
              {/* Company Name + Logo Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary tracking-wide uppercase" htmlFor="signup-companyName">Company Name</label>
                <div className="flex gap-3 items-center">
                  <div className={`group/input relative flex-1 flex items-center bg-bg-input border border-border-color rounded-md px-3.5 h-12 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] ${errors.companyName ? 'border-status-error! focus-within:border-status-error! focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]!' : ''}`}>
                    <svg className="text-text-muted shrink-0 mr-3 transition-colors duration-200 group-focus-within/input:text-primary-purple" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21h18M3 7v14M21 7v14M6 11h2M6 15h2M10 11h2M10 15h2M14 11h2M14 15h2M18 11h2M18 15h2M9 3h6l3 4H6l3-4z" />
                    </svg>
                    <input
                      type="text"
                      id="signup-companyName"
                      name="companyName"
                      placeholder="Enter company name"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="flex-1 bg-transparent border-none text-text-primary text-[0.92rem] h-full focus:outline-none placeholder-text-muted"
                    />
                  </div>
                  <div className="shrink-0 w-12 h-12 relative">
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" id="signup-logo-input" />
                    {logoPreview ? (
                      <div className="relative w-12 h-12 rounded-md overflow-hidden border border-border-color bg-bg-input flex items-center justify-center">
                        <img src={logoPreview} alt="Company logo" className="w-full h-full object-cover" />
                        <button type="button" className="absolute top-0 right-0 bg-status-error/80 text-white rounded-bl-sm p-0.5 hover:bg-status-error" onClick={removeLogo} aria-label="Remove logo" id="signup-remove-logo">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="w-12 h-12 rounded-md border border-dashed border-border-color bg-bg-input text-text-muted hover:text-text-primary hover:border-primary-purple flex items-center justify-center transition-all duration-200" onClick={() => fileInputRef.current?.click()} title="Upload Logo" id="signup-upload-logo-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {errors.companyName && <span className="text-[0.78rem] text-status-error flex items-center gap-1 mt-1 pl-1">{errors.companyName}</span>}
                {errors.logo && <span className="text-[0.78rem] text-status-error flex items-center gap-1 mt-1 pl-1">{errors.logo}</span>}
              </div>

              {/* First Name + Last Name */}
              <div className="flex gap-3 w-full">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[0.82rem] font-semibold text-text-secondary tracking-wide uppercase" htmlFor="signup-firstName">First Name</label>
                  <div className={`group/input relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 h-12 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] ${errors.firstName ? 'border-status-error! focus-within:border-status-error! focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]!' : ''}`}>
                    <svg className="text-text-muted shrink-0 mr-3 transition-colors duration-200 group-focus-within/input:text-primary-purple" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input type="text" id="signup-firstName" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} className="flex-1 bg-transparent border-none text-text-primary text-[0.92rem] h-full focus:outline-none placeholder-text-muted" />
                  </div>
                  {errors.firstName && <span className="text-[0.78rem] text-status-error flex items-center gap-1 mt-1 pl-1">{errors.firstName}</span>}
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[0.82rem] font-semibold text-text-secondary tracking-wide uppercase" htmlFor="signup-lastName">Last Name</label>
                  <div className={`group/input relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 h-12 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] ${errors.lastName ? 'border-status-error! focus-within:border-status-error! focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]!' : ''}`}>
                    <svg className="text-text-muted shrink-0 mr-3 transition-colors duration-200 group-focus-within/input:text-primary-purple" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input type="text" id="signup-lastName" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} className="flex-1 bg-transparent border-none text-text-primary text-[0.92rem] h-full focus:outline-none placeholder-text-muted" />
                  </div>
                  {errors.lastName && <span className="text-[0.78rem] text-status-error flex items-center gap-1 mt-1 pl-1">{errors.lastName}</span>}
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary tracking-wide uppercase" htmlFor="signup-email">Email</label>
                <div className={`group/input relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 h-12 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] ${errors.email ? 'border-status-error! focus-within:border-status-error! focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]!' : ''}`}>
                  <svg className="text-text-muted shrink-0 mr-3 transition-colors duration-200 group-focus-within/input:text-primary-purple" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input type="email" id="signup-email" name="email" placeholder="Enter your email address" value={formData.email} onChange={handleChange} autoComplete="email" className="flex-1 bg-transparent border-none text-text-primary text-[0.92rem] h-full focus:outline-none placeholder-text-muted" />
                </div>
                {errors.email && <span className="text-[0.78rem] text-status-error flex items-center gap-1 mt-1 pl-1">{errors.email}</span>}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary tracking-wide uppercase" htmlFor="signup-phone">Phone</label>
                <div className={`group/input relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 h-12 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] ${errors.phone ? 'border-status-error! focus-within:border-status-error! focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]!' : ''}`}>
                  <svg className="text-text-muted shrink-0 mr-3 transition-colors duration-200 group-focus-within/input:text-primary-purple" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <input type="tel" id="signup-phone" name="phone" placeholder="Enter your phone number" value={formData.phone} onChange={handleChange} autoComplete="tel" className="flex-1 bg-transparent border-none text-text-primary text-[0.92rem] h-full focus:outline-none placeholder-text-muted" />
                </div>
                {errors.phone && <span className="text-[0.78rem] text-status-error flex items-center gap-1 mt-1 pl-1">{errors.phone}</span>}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary tracking-wide uppercase" htmlFor="signup-password">Password</label>
                <div className={`group/input relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 h-12 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] ${errors.password ? 'border-status-error! focus-within:border-status-error! focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]!' : ''}`}>
                  <svg className="text-text-muted shrink-0 mr-3 transition-colors duration-200 group-focus-within/input:text-primary-purple" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input type={showPassword ? 'text' : 'password'} id="signup-password" name="signup-password" placeholder="Create a strong password" value={formData.password} onChange={handleChange} autoComplete="new-password" className="flex-1 bg-transparent border-none text-text-primary text-[0.92rem] h-full focus:outline-none placeholder-text-muted" />
                  <button type="button" className="flex items-center justify-center bg-transparent text-text-muted p-1 rounded-sm transition-all duration-200 hover:text-text-primary hover:bg-white/5" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} id="signup-toggle-password">
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
                {errors.password && <span className="text-[0.78rem] text-status-error flex items-center gap-1 mt-1 pl-1">{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary tracking-wide uppercase" htmlFor="signup-confirmPassword">Confirm Password</label>
                <div className={`group/input relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 h-12 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] ${errors.confirmPassword ? 'border-status-error! focus-within:border-status-error! focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]!' : ''}`}>
                  <svg className="text-text-muted shrink-0 mr-3 transition-colors duration-200 group-focus-within/input:text-primary-purple" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <input type={showConfirmPassword ? 'text' : 'password'} id="signup-confirmPassword" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" className="flex-1 bg-transparent border-none text-text-primary text-[0.92rem] h-full focus:outline-none placeholder-text-muted" />
                  <button type="button" className="flex items-center justify-center bg-transparent text-text-muted p-1 rounded-sm transition-all duration-200 hover:text-text-primary hover:bg-white/5" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} id="signup-toggle-confirm-password">
                    {showConfirmPassword ? (
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
                {errors.confirmPassword && <span className="text-[0.78rem] text-status-error flex items-center gap-1 mt-1 pl-1">{errors.confirmPassword}</span>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-gradient-primary hover:bg-gradient-hover text-white text-[0.95rem] font-bold tracking-wider rounded-md flex items-center justify-center transition-all duration-300 shadow-button hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 uppercase relative overflow-hidden"
              disabled={isLoading}
              id="signup-submit-btn"
            >
              {isLoading ? <span className="w-[22px] h-[22px] border-[2.5px] border-white/30 border-t-white rounded-full animate-spin"></span> : 'SIGN UP'}
            </button>

            <p className="text-center mt-6 text-[0.88rem] text-text-secondary">
              Already have an account?{' '}
              <Link to="/sign-in" className="text-text-link font-semibold transition-colors duration-200 hover:text-text-link-hover relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-primary after:transition-all after:duration-300 hover:after:w-full" id="signup-goto-signin">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignUp

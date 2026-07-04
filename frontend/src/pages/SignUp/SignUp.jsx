import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SignUp.css';

function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [companyLogo, setCompanyLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, logo: 'Logo must be less than 2MB' }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, logo: 'Please upload an image file' }));
        return;
      }
      setCompanyLogo(file);
      setErrors((prev) => ({ ...prev, logo: '' }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setCompanyLogo(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/.test(formData.password)) {
      newErrors.password = 'Must include uppercase, lowercase, number & special character';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      register({
        ...formData,
        logoPreview
      });
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };


  return (
    <div className="auth-page">
      {/* Animated background elements */}
      <div className="auth-bg-effects">
        <div className="auth-bg-orb auth-bg-orb--1"></div>
        <div className="auth-bg-orb auth-bg-orb--2"></div>
        <div className="auth-bg-orb auth-bg-orb--3"></div>
        <div className="auth-bg-grid"></div>
      </div>

      <div className="auth-container auth-container--signup">
        {/* Left branding panel */}
        <div className="auth-branding">
          <div className="auth-branding__content">
            <div className="auth-branding__icon">
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
            <h1 className="auth-branding__title">HRMS</h1>
            <p className="auth-branding__subtitle">Human Resource Management System</p>
            <p className="auth-branding__tagline">Every workday, perfectly aligned.</p>

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

        {/* Sign Up Form */}
        <div className="auth-form-wrapper auth-form-wrapper--signup">
          <form className="auth-form auth-form--signup" onSubmit={handleSubmit} id="signup-form">
            <div className="auth-form__header">
              <div className="auth-form__logo-mobile">
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
              <h2 className="auth-form__title">Sign Up</h2>
              <p className="auth-form__description">Create your organization account to get started.</p>
            </div>

            <div className="auth-form__fields">
              {/* Company Name + Logo Upload */}
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="signup-companyName">
                  Company Name
                </label>
                <div className="signup-company-row">
                  <div className={`auth-field__input-wrapper ${errors.companyName ? 'auth-field__input-wrapper--error' : ''}`}>
                    <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21h18M3 7v14M21 7v14M6 11h2M6 15h2M10 11h2M10 15h2M14 11h2M14 15h2M18 11h2M18 15h2M9 3h6l3 4H6l3-4z" />
                    </svg>
                    <input
                      type="text"
                      id="signup-companyName"
                      name="companyName"
                      placeholder="Enter company name"
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="signup-logo-upload">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="signup-logo-upload__input"
                      id="signup-logo-input"
                    />
                    {logoPreview ? (
                      <div className="signup-logo-upload__preview">
                        <img src={logoPreview} alt="Company logo" />
                        <button
                          type="button"
                          className="signup-logo-upload__remove"
                          onClick={removeLogo}
                          aria-label="Remove logo"
                          id="signup-remove-logo"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="signup-logo-upload__btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload Logo"
                        id="signup-upload-logo-btn"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {errors.companyName && <span className="auth-field__error">{errors.companyName}</span>}
                {errors.logo && <span className="auth-field__error">{errors.logo}</span>}
              </div>

              {/* Name */}
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="signup-name">
                  Name
                </label>
                <div className={`auth-field__input-wrapper ${errors.name ? 'auth-field__input-wrapper--error' : ''}`}>
                  <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    id="signup-name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                {errors.name && <span className="auth-field__error">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="signup-email">
                  Email
                </label>
                <div className={`auth-field__input-wrapper ${errors.email ? 'auth-field__input-wrapper--error' : ''}`}>
                  <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    id="signup-email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="auth-field__error">{errors.email}</span>}
              </div>

              {/* Phone */}
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="signup-phone">
                  Phone
                </label>
                <div className={`auth-field__input-wrapper ${errors.phone ? 'auth-field__input-wrapper--error' : ''}`}>
                  <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <input
                    type="tel"
                    id="signup-phone"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && <span className="auth-field__error">{errors.phone}</span>}
              </div>

              {/* Password */}
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="signup-password">
                  Password
                </label>
                <div className={`auth-field__input-wrapper ${errors.password ? 'auth-field__input-wrapper--error' : ''}`}>
                  <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="signup-password"
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-field__toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    id="signup-toggle-password"
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
                {errors.password && <span className="auth-field__error">{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="signup-confirmPassword">
                  Confirm Password
                </label>
                <div className={`auth-field__input-wrapper ${errors.confirmPassword ? 'auth-field__input-wrapper--error' : ''}`}>
                  <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="signup-confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-field__toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    id="signup-toggle-confirm-password"
                  >
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
                {errors.confirmPassword && <span className="auth-field__error">{errors.confirmPassword}</span>}
              </div>
            </div>

            <button
              type="submit"
              className={`auth-form__submit ${isLoading ? 'auth-form__submit--loading' : ''}`}
              disabled={isLoading}
              id="signup-submit-btn"
            >
              {isLoading ? (
                <span className="auth-form__spinner"></span>
              ) : (
                'SIGN UP'
              )}
            </button>

            <p className="auth-form__footer">
              Already have an account?{' '}
              <Link to="/sign-in" className="auth-form__link" id="signup-goto-signin">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;

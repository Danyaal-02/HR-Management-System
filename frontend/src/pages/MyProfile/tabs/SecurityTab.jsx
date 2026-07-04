import { useState } from 'react';
import './tabs.css';

function SecurityTab() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMsg('');
      return;
    }

    // Simulate save success
    setSuccessMsg('Password updated successfully!');
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
  };

  return (
    <div className="profile-tab-content security-tab">
      <form onSubmit={handleSubmit} className="security-form" id="password-change-form">
        <h3 className="security-form__title">Change Password</h3>
        <p className="security-form__desc">Update your login password regularly to keep your account secure.</p>
        
        {successMsg && <div className="security-form__success">{successMsg}</div>}

        <div className="security-form__fields">
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="sec-current-password">Current Password</label>
            <div className={`auth-field__input-wrapper ${errors.currentPassword ? 'auth-field__input-wrapper--error' : ''}`}>
              <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              />
              <button
                type="button"
                className="auth-field__toggle"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.currentPassword && <span className="auth-field__error">{errors.currentPassword}</span>}
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="sec-new-password">New Password</label>
            <div className={`auth-field__input-wrapper ${errors.newPassword ? 'auth-field__input-wrapper--error' : ''}`}>
              <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              />
              <button
                type="button"
                className="auth-field__toggle"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.newPassword && <span className="auth-field__error">{errors.newPassword}</span>}
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="sec-confirm-password">Confirm New Password</label>
            <div className={`auth-field__input-wrapper ${errors.confirmPassword ? 'auth-field__input-wrapper--error' : ''}`}>
              <svg className="auth-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              />
              <button
                type="button"
                className="auth-field__toggle"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && <span className="auth-field__error">{errors.confirmPassword}</span>}
          </div>
        </div>

        <button type="submit" className="auth-form__submit security-form__btn" id="sec-submit-btn">
          Update Password
        </button>
      </form>
    </div>
  );
}

export default SecurityTab;

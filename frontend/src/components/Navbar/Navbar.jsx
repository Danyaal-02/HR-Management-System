import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AvatarDropdown from '../AvatarDropdown/AvatarDropdown';
import './Navbar.css';

function Navbar() {
  const { user, checkedIn, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <nav className="navbar" id="hrms-main-nav">
      <div className="navbar__container">
        <div className="navbar__left">
          <Link to="/dashboard" className="navbar__logo" id="nav-logo">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="10" fill="url(#nav-logo-grad)" />
              <path d="M14 16h8v4h-8v-4zm0 8h20v4H14v-4zm0 8h16v4H14v-4zm12-16h8v4h-8v-4z" fill="white" />
              <defs>
                <linearGradient id="nav-logo-grad" x1="0" y1="0" x2="48" y2="48">
                  <stop stopColor="#a855f7" />
                  <stop offset="1" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
            <span className="navbar__brand-text">Odoo India</span>
          </Link>

          <div className="navbar__links">
            <Link
              to="/dashboard"
              className={`navbar__link ${location.pathname === '/dashboard' ? 'navbar__link--active' : ''}`}
              id="nav-link-employees"
            >
              Employees
            </Link>
            <Link
              to="/attendance"
              className={`navbar__link ${location.pathname === '/attendance' ? 'navbar__link--active' : ''}`}
              id="nav-link-attendance"
            >
              Attendance
            </Link>
            <Link
              to="/timeoff"
              className={`navbar__link ${location.pathname === '/timeoff' ? 'navbar__link--active' : ''}`}
              id="nav-link-timeoff"
            >
              Time Off
            </Link>
          </div>
        </div>

        <div className="navbar__right">
          {user && (
            <div className="navbar__profile-section" ref={dropdownRef}>
              {/* Check-in status indicator dot */}
              <div 
                className={`navbar__status-indicator ${checkedIn ? 'navbar__status-indicator--online' : 'navbar__status-indicator--offline'}`}
                title={checkedIn ? 'Checked In' : 'Checked Out'}
                id="nav-status-dot"
              ></div>
              
              <button
                type="button"
                className="navbar__avatar-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                id="nav-avatar-btn"
              >
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="navbar__avatar-img" />
                ) : (
                  <div className="navbar__avatar-placeholder">
                    {getInitials(user.name)}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <AvatarDropdown
                  onClose={() => setDropdownOpen(false)}
                  onLogout={handleLogout}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

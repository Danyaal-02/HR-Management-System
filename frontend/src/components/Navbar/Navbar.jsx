import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AvatarDropdown from '../AvatarDropdown/AvatarDropdown'

function Navbar() {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/sign-in')
  }

  const getInitials = (u) => {
    if (!u) return '??'
    if (u.first_name || u.last_name) {
      return ((u.first_name?.[0] || '') + (u.last_name?.[0] || '')).toUpperCase() || '??'
    }
    const name = u.name || ''
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <nav className="h-16 bg-bg-card border-b border-border-color/30 sticky top-0 z-50 shadow-[0_2px_10px_rgba(0,0,0,0.2)]" id="hrms-main-nav">
      <div className="max-w-[1200px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-5 sm:gap-10">
          <Link to="/dashboard" className="flex items-center gap-2.5 font-bold text-lg bg-gradient-primary bg-clip-text text-transparent transition-transform duration-200 hover:scale-[1.02]" id="nav-logo">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="10" fill="url(#nav-logo-grad)" />
              <path
                d="M14 16h8v4h-8v-4zm0 8h20v4H14v-4zm0 8h16v4H14v-4zm12-16h8v4h-8v-4z"
                fill="white"
              />
              <defs>
                <linearGradient
                  id="nav-logo-grad"
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
            <span className="tracking-wide">Odoo India</span>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-6">
            <Link
              to="/dashboard"
              className={`text-[0.85rem] sm:text-[0.92rem] font-medium text-text-secondary px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm transition-all duration-200 hover:text-text-primary hover:bg-white/5 ${
                location.pathname === '/dashboard' ? 'text-primary-purple !bg-primary-purple/10 font-semibold' : ''
              }`}
              id="nav-link-employees"
            >
              Employees
            </Link>
            <Link
              to="/attendance"
              className={`text-[0.85rem] sm:text-[0.92rem] font-medium text-text-secondary px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm transition-all duration-200 hover:text-text-primary hover:bg-white/5 ${
                location.pathname === '/attendance' ? 'text-primary-purple !bg-primary-purple/10 font-semibold' : ''
              }`}
              id="nav-link-attendance"
            >
              Attendance
            </Link>
            <Link
              to="/timeoff"
              className={`text-[0.85rem] sm:text-[0.92rem] font-medium text-text-secondary px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm transition-all duration-200 hover:text-text-primary hover:bg-white/5 ${
                location.pathname === '/timeoff' ? 'text-primary-purple !bg-primary-purple/10 font-semibold' : ''
              }`}
              id="nav-link-timeoff"
            >
              Time Off
            </Link>
          </div>
        </div>

        <div className="flex items-center">
          {user && (
            <div className="relative flex items-center gap-3" ref={dropdownRef}>
              <button
                type="button"
                className="bg-transparent rounded-full p-[2px] border-2 border-transparent transition-all duration-200 hover:border-primary-purple hover:scale-[1.05] flex items-center justify-center"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                id="nav-avatar-btn"
              >
                {user.profile_picture || user.profilePicture ? (
                  <img
                    src={user.profile_picture || user.profilePicture}
                    alt={user.first_name || user.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold text-[0.85rem] tracking-wider">
                    {getInitials(user)}
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
  )
}

export default Navbar

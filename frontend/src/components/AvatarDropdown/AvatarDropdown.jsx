import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AvatarDropdown.css'

function AvatarDropdown({ onClose, onLogout }) {
  const { user } = useAuth()

  return (
    <div
      className="avatar-dropdown"
      role="menu"
      aria-label="User Profile Dropdown"
      id="avatar-dropdown-menu"
    >
      <div className="avatar-dropdown__header">
        <span className="avatar-dropdown__name">{user?.name}</span>
        <span className="avatar-dropdown__role">{user?.role}</span>
      </div>
      <div className="avatar-dropdown__divider"></div>
      <div className="avatar-dropdown__items">
        <Link
          to="/my-profile"
          className="avatar-dropdown__item"
          onClick={onClose}
          id="dropdown-link-profile"
          role="menuitem"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          My Profile
        </Link>
        <button
          type="button"
          className="avatar-dropdown__item avatar-dropdown__item--logout"
          onClick={() => {
            onClose()
            onLogout()
          }}
          id="dropdown-btn-logout"
          role="menuitem"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </button>
      </div>
    </div>
  )
}

export default AvatarDropdown

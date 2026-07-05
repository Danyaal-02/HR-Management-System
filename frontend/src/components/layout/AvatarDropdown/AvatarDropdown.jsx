import { Link } from 'react-router-dom'
import { useAuth } from '../../../features/auth'

function AvatarDropdown({ onClose, onLogout }) {
  const { user } = useAuth()

  return (
    <div
      className="absolute top-[50px] right-0 w-[200px] bg-bg-card border border-border-color rounded-md shadow-[0_10px_25px_rgba(0,0,0,0.5),0_0_30px_rgba(168,85,247,0.15)] z-[1000] py-2 origin-top-right transition-all duration-200"
      role="menu"
      aria-label="User Profile Dropdown"
      id="avatar-dropdown-menu"
    >
      <div className="px-4 py-3 flex flex-col">
        <span className="text-[0.9rem] font-semibold text-text-primary truncate">
          {user?.first_name
            ? `${user.first_name} ${user.last_name || ''}`.trim()
            : user?.name || ''}
        </span>
        <span className="text-[0.75rem] text-text-muted font-medium mt-0.5">
          {user?.role === 'admin' ? 'HR Admin' : user?.role}
        </span>
      </div>
      <div className="h-[1px] bg-border-color my-1.5"></div>
      <div className="flex flex-col px-1.5">
        <Link
          to="/my-profile"
          className="group/item w-full flex items-center gap-2.5 px-3 py-2.5 text-[0.85rem] text-text-secondary rounded-sm bg-transparent text-left transition-all duration-200 hover:text-text-primary hover:bg-white/5"
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
            className="text-text-muted transition-colors duration-200 group-hover/item:text-primary-purple"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          My Profile
        </Link>
        <button
          type="button"
          className="group/logout w-full flex items-center gap-2.5 px-3 py-2.5 text-[0.85rem] text-text-secondary rounded-sm bg-transparent text-left transition-all duration-200 hover:text-status-error hover:bg-status-error/8"
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
            className="text-text-muted transition-colors duration-200 group-hover/logout:text-status-error"
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

function EmployeeCard({ employee, onClick }) {
  // Support both old mock shape (name, profilePicture, status)
  // and new API shape (first_name, last_name, profile_picture, today_status)
  const displayName =
    employee.name ||
    `${employee.first_name || ''} ${employee.last_name || ''}`.trim() ||
    'Unknown'
  const avatarUrl = employee.profilePicture || employee.profile_picture || null
  const status = employee.today_status || employee.status || 'absent'

  const getInitials = (name) => {
    if (!name) return '??'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'present':
        return (
          <div
            className="absolute top-4 right-4 w-[22px] h-[22px] rounded-full flex items-center justify-center bg-[#181824] border border-border-color"
            title="Present in office"
          >
            <span className="w-2 h-2 rounded-full bg-status-success shadow-[0_0_6px_#22c55e]"></span>
          </div>
        )
      case 'leave':
        return (
          <div
            className="absolute top-4 right-4 w-[22px] h-[22px] rounded-full flex items-center justify-center bg-[#181824] border border-border-color text-status-info"
            title="On Leave"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
        )
      case 'absent':
      default:
        return (
          <div
            className="absolute top-4 right-4 w-[22px] h-[22px] rounded-full flex items-center justify-center bg-[#181824] border border-border-color"
            title="Absent"
          >
            <span className="w-2 h-2 rounded-full bg-status-warning shadow-[0_0_6px_#f59e0b]"></span>
          </div>
        )
    }
  }

  return (
    <div
      className="group relative bg-bg-card border border-border-color rounded-lg p-6 flex flex-col items-center text-center cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:-translate-y-1.5 hover:border-primary-purple/30 hover:shadow-[0_8px_24px_rgba(168,85,247,0.1),0_0_30px_rgba(168,85,247,0.15)] focus-visible:outline-2 focus-visible:outline-primary-purple focus-visible:outline-offset-2"
      onClick={() => onClick(employee.id)}
      id={`employee-card-${employee.id}`}
      role="button"
      tabIndex="0"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(employee.id)
        }
      }}
    >
      {/* Top right status badge */}
      {getStatusIndicator(status)}

      <div className="w-[72px] h-[72px] rounded-full overflow-hidden mb-4 border-2 border-border-color bg-bg-dark flex items-center justify-center transition-colors duration-300 group-hover:border-primary-purple">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-purple/15 to-primary-pink/10 text-primary-purple flex items-center justify-center font-bold text-lg tracking-wide">
            {getInitials(displayName)}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-[1.05rem] text-text-primary mb-1 tracking-tight">{displayName}</h3>
        <p className="text-[0.85rem] font-medium text-text-secondary">{employee.role}</p>
        <p className="text-[0.78rem] text-text-muted mt-1 uppercase tracking-wider font-semibold">{employee.department}</p>
      </div>
    </div>
  )
}

export default EmployeeCard

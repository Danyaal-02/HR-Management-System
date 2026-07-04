import './EmployeeCard.css';

function EmployeeCard({ employee, onClick }) {
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'present':
        return (
          <div className="employee-card__status employee-card__status--present" title="Present in office">
            <span className="employee-card__status-dot"></span>
          </div>
        );
      case 'leave':
        return (
          <div className="employee-card__status employee-card__status--leave" title="On Leave">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
        );
      case 'absent':
      default:
        return (
          <div className="employee-card__status employee-card__status--absent" title="Absent">
            <span className="employee-card__status-dot"></span>
          </div>
        );
    }
  };

  return (
    <div 
      className="employee-card" 
      onClick={() => onClick(employee.id)} 
      id={`employee-card-${employee.id}`}
      role="button"
      tabIndex="0"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(employee.id);
        }
      }}
    >
      {/* Top right status badge */}
      {getStatusIndicator(employee.status)}

      <div className="employee-card__avatar-container">
        {employee.profilePicture ? (
          <img src={employee.profilePicture} alt={employee.name} className="employee-card__avatar-img" />
        ) : (
          <div className="employee-card__avatar-placeholder">
            {getInitials(employee.name)}
          </div>
        )}
      </div>

      <div className="employee-card__info">
        <h3 className="employee-card__name">{employee.name}</h3>
        <p className="employee-card__role">{employee.role}</p>
        <p className="employee-card__dept">{employee.department}</p>
      </div>
    </div>
  );
}

export default EmployeeCard;

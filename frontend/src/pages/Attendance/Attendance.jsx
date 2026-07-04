import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import './Attendance.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function Attendance() {
  const {
    user,
    employees,
    getEmployeeAttendance,
    getAttendanceByDate,
    calculateWorkHours,
    getMonthlyStats
  } = useAuth();

  const isAdmin = user?.role === 'HR';

  // ===== Employee View State =====
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(9); // October (0-indexed)
  const [selectedYear, setSelectedYear] = useState(2025);

  // ===== Admin View State =====
  const [adminDate, setAdminDate] = useState('2025-10-22');
  const [searchQuery, setSearchQuery] = useState('');

  // ===== Employee View Data =====
  const employeeMonthLogs = useMemo(() => {
    if (!user) return [];
    return getEmployeeAttendance(user.id, selectedMonth, selectedYear);
  }, [user, selectedMonth, selectedYear, getEmployeeAttendance]);

  const monthlyStats = useMemo(() => {
    if (!user) return { presentDays: 0, leaveDays: 0, totalWorkingDays: 0 };
    return getMonthlyStats(user.id, selectedMonth, selectedYear);
  }, [user, selectedMonth, selectedYear, getMonthlyStats]);

  // ===== Admin View Data =====
  const adminLogs = useMemo(() => {
    const logs = getAttendanceByDate(adminDate);
    // Enrich with employee info
    return logs.map(log => {
      const emp = employees.find(e => e.id === log.employeeId);
      return { ...log, employee: emp };
    }).filter(log => {
      if (!searchQuery.trim()) return true;
      return log.employee?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [adminDate, employees, searchQuery, getAttendanceByDate]);

  const formatDisplayDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()}, ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTableDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const navigateAdminDate = (direction) => {
    const d = new Date(adminDate);
    d.setDate(d.getDate() + direction);
    setAdminDate(d.toISOString().split('T')[0]);
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // ===== EMPLOYEE VIEW =====
  const renderEmployeeView = () => (
    <div className="attendance-employee" id="attendance-employee-view">
      {/* Month Selector */}
      <div className="attendance-controls">
        <h2 className="attendance-title">My Attendance</h2>
        <div className="attendance-month-select">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="attendance-select"
            id="attendance-month-dropdown"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="attendance-select"
            id="attendance-year-dropdown"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="attendance-stats" id="attendance-stats-cards">
        <div className="attendance-stat-card attendance-stat-card--present">
          <div className="attendance-stat-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="attendance-stat-card__content">
            <span className="attendance-stat-card__number">{monthlyStats.presentDays}</span>
            <span className="attendance-stat-card__label">Days Present</span>
          </div>
        </div>
        <div className="attendance-stat-card attendance-stat-card--leaves">
          <div className="attendance-stat-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="attendance-stat-card__content">
            <span className="attendance-stat-card__number">{monthlyStats.leaveDays}</span>
            <span className="attendance-stat-card__label">Leaves</span>
          </div>
        </div>
        <div className="attendance-stat-card attendance-stat-card--total">
          <div className="attendance-stat-card__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="attendance-stat-card__content">
            <span className="attendance-stat-card__number">{monthlyStats.totalWorkingDays}</span>
            <span className="attendance-stat-card__label">Total Working Days</span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="attendance-table-container">
        <table className="attendance-table" id="attendance-log-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Work Hours</th>
              <th>Extra Hours</th>
            </tr>
          </thead>
          <tbody>
            {employeeMonthLogs.length > 0 ? (
              employeeMonthLogs.map((log, idx) => {
                const { total, extra } = calculateWorkHours(log.checkIn, log.checkOut);
                return (
                  <tr key={idx}>
                    <td className="attendance-table__date">{formatTableDate(log.date)}</td>
                    <td>
                      <span className="attendance-time-badge attendance-time-badge--in">{log.checkIn || '--:--'}</span>
                    </td>
                    <td>
                      <span className="attendance-time-badge attendance-time-badge--out">{log.checkOut || '--:--'}</span>
                    </td>
                    <td>
                      <span className="attendance-hours">{total}</span>
                    </td>
                    <td>
                      <span className={`attendance-extra ${extra !== '00:00' ? 'attendance-extra--has' : ''}`}>
                        {extra}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="attendance-table__empty">
                  No attendance records for {MONTHS[selectedMonth]} {selectedYear}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ===== ADMIN VIEW =====
  const renderAdminView = () => (
    <div className="attendance-admin" id="attendance-admin-view">
      {/* Date Navigation */}
      <div className="attendance-controls">
        <h2 className="attendance-title">All Employees Attendance</h2>
        <div className="attendance-date-nav">
          <button 
            className="attendance-nav-btn" 
            onClick={() => navigateAdminDate(-1)}
            id="attendance-prev-day"
            title="Previous Day"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="attendance-date-display">
            <input
              type="date"
              value={adminDate}
              onChange={(e) => setAdminDate(e.target.value)}
              className="attendance-date-input"
              id="attendance-date-picker"
            />
            <span className="attendance-date-text">{formatDisplayDate(adminDate)}</span>
          </div>
          <button 
            className="attendance-nav-btn" 
            onClick={() => navigateAdminDate(1)}
            id="attendance-next-day"
            title="Next Day"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="attendance-search-container">
        <svg className="attendance-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="attendance-search-input"
          id="attendance-search-input"
        />
      </div>

      {/* Admin Attendance Table */}
      <div className="attendance-table-container">
        <table className="attendance-table attendance-table--admin" id="admin-attendance-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Work Hours</th>
              <th>Extra Hours</th>
            </tr>
          </thead>
          <tbody>
            {adminLogs.length > 0 ? (
              adminLogs.map((log, idx) => {
                const { total, extra } = calculateWorkHours(log.checkIn, log.checkOut);
                return (
                  <tr key={idx}>
                    <td>
                      <div className="attendance-employee-cell">
                        {log.employee?.profilePicture ? (
                          <img src={log.employee.profilePicture} alt={log.employee?.name} className="attendance-avatar-img" />
                        ) : (
                          <div className="attendance-avatar-placeholder">
                            {getInitials(log.employee?.name)}
                          </div>
                        )}
                        <div className="attendance-employee-info">
                          <span className="attendance-employee-name">{log.employee?.name || 'Unknown'}</span>
                          <span className="attendance-employee-dept">{log.employee?.department || ''}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="attendance-time-badge attendance-time-badge--in">{log.checkIn || '--:--'}</span>
                    </td>
                    <td>
                      <span className="attendance-time-badge attendance-time-badge--out">{log.checkOut || '--:--'}</span>
                    </td>
                    <td>
                      <span className="attendance-hours">{total}</span>
                    </td>
                    <td>
                      <span className={`attendance-extra ${extra !== '00:00' ? 'attendance-extra--has' : ''}`}>
                        {extra}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="attendance-table__empty">
                  No attendance records for {formatDisplayDate(adminDate)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="attendance-page">
      <Navbar />
      <main className="attendance-main">
        {isAdmin ? renderAdminView() : renderEmployeeView()}

        {/* Admin can also view employee-level stats below */}
        {isAdmin && (
          <div className="attendance-admin-employee-section">
            <h3 className="attendance-section-title">Monthly Employee Summary</h3>
            <div className="attendance-month-select" style={{ marginBottom: '20px' }}>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="attendance-select"
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="attendance-select"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="attendance-table-container">
              <table className="attendance-table" id="admin-monthly-summary-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Present Days</th>
                    <th>Leaves</th>
                    <th>Total Working Days</th>
                    <th>Payable Days</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const stats = getMonthlyStats(emp.id, selectedMonth, selectedYear);
                    return (
                      <tr key={emp.id}>
                        <td>
                          <div className="attendance-employee-cell">
                            {emp.profilePicture ? (
                              <img src={emp.profilePicture} alt={emp.name} className="attendance-avatar-img" />
                            ) : (
                              <div className="attendance-avatar-placeholder">
                                {getInitials(emp.name)}
                              </div>
                            )}
                            <span className="attendance-employee-name">{emp.name}</span>
                          </div>
                        </td>
                        <td>{stats.presentDays}</td>
                        <td>{stats.leaveDays}</td>
                        <td>{stats.totalWorkingDays}</td>
                        <td>
                          <span className="attendance-payable-badge">{stats.payableDays}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Attendance;

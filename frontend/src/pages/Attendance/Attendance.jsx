import { useState, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useMyAttendance, useAdminAttendanceOverview } from '../../hooks/useAttendanceApi'
import Navbar from '../../components/Navbar/Navbar'
import './Attendance.css'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function Attendance() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const now = new Date()

  // ===== Employee View State =====
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  // ===== Admin View State =====
  const [adminDate, setAdminDate] = useState(now.toISOString().split('T')[0])
  const [searchQuery, setSearchQuery] = useState('')

  // ─── Employee date range ───────────────────────────────────────────────────
  const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`
  const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate()
  const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  // ─── TanStack Query hooks ──────────────────────────────────────────────────
  const { data: myAttendanceData, isLoading: loadingEmployee } = useMyAttendance(
    { startDate, endDate },
    { enabled: !isAdmin && !!user }
  )

  const { data: adminData, isLoading: loadingAdmin } = useAdminAttendanceOverview(adminDate, {
    enabled: isAdmin,
  })

  // ─── Derived data ──────────────────────────────────────────────────────────
  const employeeMonthLogs = myAttendanceData?.data || []
  const monthlyStats = myAttendanceData?.summary || { days_present: 0, days_leave: 0, total_working_days: 0 }

  const adminLogs = useMemo(() => {
    const raw = adminData?.data || []
    if (!searchQuery.trim()) return raw
    return raw.filter((log) =>
      `${log.first_name} ${log.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [adminData, searchQuery])

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const formatDisplayDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return `${d.getDate()}, ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  }

  const formatTableDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr + 'T00:00:00')
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }

  const navigateAdminDate = (direction) => {
    const d = new Date(adminDate + 'T00:00:00')
    d.setDate(d.getDate() + direction)
    setAdminDate(d.toISOString().split('T')[0])
  }

  const getInitials = (firstName, lastName) => {
    const f = (firstName || '')[0] || ''
    const l = (lastName || '')[0] || ''
    return (f + l).toUpperCase() || '??'
  }

  const formatWorkHours = (hours) => {
    if (hours == null) return '00:00'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const formatExtraHours = (workHours) => {
    if (workHours == null || workHours <= 8) return '00:00'
    const extra = workHours - 8
    const h = Math.floor(extra)
    const m = Math.round((extra - h) * 60)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

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
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="attendance-select"
            id="attendance-year-dropdown"
          >
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
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
            <span className="attendance-stat-card__number">{monthlyStats.days_present}</span>
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
            <span className="attendance-stat-card__number">{monthlyStats.days_leave}</span>
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
            </svg>
          </div>
          <div className="attendance-stat-card__content">
            <span className="attendance-stat-card__number">{monthlyStats.total_working_days}</span>
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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loadingEmployee ? (
              <tr><td colSpan="6" className="attendance-table__empty">Loading…</td></tr>
            ) : employeeMonthLogs.length > 0 ? (
              employeeMonthLogs.map((log, idx) => (
                <tr key={idx}>
                  <td className="attendance-table__date">{formatTableDate(log.date)}</td>
                  <td>
                    <span className="attendance-time-badge attendance-time-badge--in">
                      {log.check_in || '--:--'}
                    </span>
                  </td>
                  <td>
                    <span className="attendance-time-badge attendance-time-badge--out">
                      {log.check_out || '--:--'}
                    </span>
                  </td>
                  <td><span className="attendance-hours">{formatWorkHours(log.work_hours)}</span></td>
                  <td>
                    <span className={`attendance-extra ${log.work_hours > 8 ? 'attendance-extra--has' : ''}`}>
                      {formatExtraHours(log.work_hours)}
                    </span>
                  </td>
                  <td>
                    <span className={`timeoff-status-badge timeoff-status--${log.status}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="attendance-table__empty">
                  No attendance records for {MONTHS[selectedMonth]} {selectedYear}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ===== ADMIN VIEW =====
  const renderAdminView = () => (
    <div className="attendance-admin" id="attendance-admin-view">
      {/* Date Navigation */}
      <div className="attendance-controls">
        <h2 className="attendance-title">All Employees Attendance</h2>
        <div className="attendance-date-nav">
          <button className="attendance-nav-btn" onClick={() => navigateAdminDate(-1)} id="attendance-prev-day" title="Previous Day">
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
          <button className="attendance-nav-btn" onClick={() => navigateAdminDate(1)} id="attendance-next-day" title="Next Day">
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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loadingAdmin ? (
              <tr><td colSpan="6" className="attendance-table__empty">Loading…</td></tr>
            ) : adminLogs.length > 0 ? (
              adminLogs.map((log, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="attendance-employee-cell">
                      {log.profile_picture ? (
                        <img src={log.profile_picture} alt={log.first_name} className="attendance-avatar-img" />
                      ) : (
                        <div className="attendance-avatar-placeholder">
                          {getInitials(log.first_name, log.last_name)}
                        </div>
                      )}
                      <div className="attendance-employee-info">
                        <span className="attendance-employee-name">{log.first_name} {log.last_name}</span>
                        <span className="attendance-employee-dept">{log.department || ''}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="attendance-time-badge attendance-time-badge--in">{log.check_in || '--:--'}</span>
                  </td>
                  <td>
                    <span className="attendance-time-badge attendance-time-badge--out">{log.check_out || '--:--'}</span>
                  </td>
                  <td><span className="attendance-hours">{formatWorkHours(log.work_hours)}</span></td>
                  <td>
                    <span className={`attendance-extra ${log.work_hours > 8 ? 'attendance-extra--has' : ''}`}>
                      {formatExtraHours(log.work_hours)}
                    </span>
                  </td>
                  <td>
                    <span className={`timeoff-status-badge timeoff-status--${log.status || 'absent'}`}>
                      {log.status || 'absent'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="attendance-table__empty">
                  No attendance records for {formatDisplayDate(adminDate)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="attendance-page">
      <Navbar />
      <main className="attendance-main">
        {isAdmin ? renderAdminView() : renderEmployeeView()}
      </main>
    </div>
  )
}

export default Attendance

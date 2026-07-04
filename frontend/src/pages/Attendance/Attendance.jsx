import { useState, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useMyAttendance, useAdminAttendanceOverview } from '../../hooks/useAttendanceApi'
import Navbar from '../../components/Navbar/Navbar'

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
    <div className="flex flex-col gap-6" id="attendance-employee-view">
      {/* Month Selector */}
      <div className="flex items-center justify-between mb-7 flex-wrap gap-4">
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">My Attendance</h2>
        <div className="flex gap-2.5">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-bg-card border border-border-color text-text-primary px-4 py-2.5 rounded-md text-[0.9rem] font-medium cursor-pointer transition-all duration-200 hover:border-primary-purple focus:border-primary-purple focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] focus:outline-none"
            id="attendance-month-dropdown"
          >
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-bg-card border border-border-color text-text-primary px-4 py-2.5 rounded-md text-[0.9rem] font-medium cursor-pointer transition-all duration-200 hover:border-primary-purple focus:border-primary-purple focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] focus:outline-none"
            id="attendance-year-dropdown"
          >
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-5 mb-8 max-md:grid-cols-1" id="attendance-stats-cards">
        <div className="bg-bg-card border border-border-color rounded-2xl p-6 flex items-center gap-[18px] hover:-translate-y-0.5 hover:shadow-card transition-all duration-300 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:rounded-[4px_0_0_4px] before:bg-status-success">
          <div className="w-12 h-12 rounded-md flex items-center justify-center shrink-0 bg-status-success/12 text-status-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[1.8rem] font-extrabold text-text-primary leading-none">{monthlyStats.days_present}</span>
            <span className="text-[0.85rem] text-text-secondary mt-1">Days Present</span>
          </div>
        </div>
        <div className="bg-bg-card border border-border-color rounded-2xl p-6 flex items-center gap-[18px] hover:-translate-y-0.5 hover:shadow-card transition-all duration-300 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:rounded-[4px_0_0_4px] before:bg-status-warning">
          <div className="w-12 h-12 rounded-md flex items-center justify-center shrink-0 bg-status-warning/12 text-status-warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[1.8rem] font-extrabold text-text-primary leading-none">{monthlyStats.days_leave}</span>
            <span className="text-[0.85rem] text-text-secondary mt-1">Leaves</span>
          </div>
        </div>
        <div className="bg-bg-card border border-border-color rounded-2xl p-6 flex items-center gap-[18px] hover:-translate-y-0.5 hover:shadow-card transition-all duration-300 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:rounded-[4px_0_0_4px] before:bg-status-info">
          <div className="w-12 h-12 rounded-md flex items-center justify-center shrink-0 bg-status-info/12 text-status-info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[1.8rem] font-extrabold text-text-primary leading-none">{monthlyStats.total_working_days}</span>
            <span className="text-[0.85rem] text-text-secondary mt-1">Total Working Days</span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-bg-card border border-border-color rounded-2xl overflow-hidden shadow-card">
        <table className="w-full border-collapse" id="attendance-log-table">
          <thead>
            <tr className="bg-primary-purple/6">
              <th className="px-5 py-3.5 text-left text-[0.8rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Date</th>
              <th className="px-5 py-3.5 text-left text-[0.8rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Check In</th>
              <th className="px-5 py-3.5 text-left text-[0.8rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Check Out</th>
              <th className="px-5 py-3.5 text-left text-[0.8rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Work Hours</th>
              <th className="px-5 py-3.5 text-left text-[0.8rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Extra Hours</th>
              <th className="px-5 py-3.5 text-left text-[0.8rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Status</th>
            </tr>
          </thead>
          <tbody>
            {loadingEmployee ? (
              <tr><td colSpan="6" className="text-center py-10 px-5 text-text-muted italic">Loading…</td></tr>
            ) : employeeMonthLogs.length > 0 ? (
              employeeMonthLogs.map((log, idx) => (
                <tr key={idx} className="transition-colors duration-200 hover:bg-primary-purple/4">
                  <td className="px-5 py-3.5 text-[0.9rem] text-text-primary border-b border-border-color/30 font-semibold tabular-nums">{formatTableDate(log.date)}</td>
                  <td className="px-5 py-3.5 text-[0.9rem] text-text-primary border-b border-border-color/30">
                    <span className="inline-block px-3 py-1 rounded-full text-[0.85rem] font-semibold tabular-nums bg-status-success/10 text-status-success">
                      {log.check_in || '--:--'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[0.9rem] text-text-primary border-b border-border-color/30">
                    <span className="inline-block px-3 py-1 rounded-full text-[0.85rem] font-semibold tabular-nums bg-status-error/10 text-status-error">
                      {log.check_out || '--:--'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[0.9rem] text-text-primary border-b border-border-color/30"><span className="font-semibold tabular-nums text-text-primary">{formatWorkHours(log.work_hours)}</span></td>
                  <td className="px-5 py-3.5 text-[0.9rem] text-text-primary border-b border-border-color/30">
                    <span className={`tabular-nums ${log.work_hours > 8 ? 'text-status-success font-semibold' : 'text-text-muted'}`}>
                      {formatExtraHours(log.work_hours)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[0.9rem] text-text-primary border-b border-border-color/30">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[12px] font-semibold capitalize ${
                      log.status === 'present' ? 'bg-status-success/15 text-status-success' :
                      log.status === 'leave' ? 'bg-status-info/15 text-status-info' : 'bg-status-error/15 text-status-error'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-10 px-5 text-text-muted italic border-b border-border-color/30">
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
    <div className="flex flex-col gap-6" id="attendance-admin-view">
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-7 flex-wrap gap-4">
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">All Employees Attendance</h2>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center bg-bg-card border border-border-color rounded-md text-text-secondary hover:border-primary-purple hover:text-primary-purple hover:bg-primary-purple/8 hover:scale-105 transition-all duration-200" onClick={() => navigateAdminDate(-1)} id="attendance-prev-day" title="Previous Day">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="relative flex items-center">
            <input
              type="date"
              value={adminDate}
              onChange={(e) => setAdminDate(e.target.value)}
              className="absolute opacity-0 w-full h-full cursor-pointer z-10"
              id="attendance-date-picker"
            />
            <span className="bg-bg-card border border-border-color px-5 py-2.5 rounded-md text-[0.95rem], font-semibold text-text-primary min-w-[220px] text-center cursor-pointer hover:border-primary-purple transition-all duration-200">{formatDisplayDate(adminDate)}</span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center bg-bg-card border border-border-color rounded-md text-text-secondary hover:border-primary-purple hover:text-primary-purple hover:bg-primary-purple/8 hover:scale-105 transition-all duration-200" onClick={() => navigateAdminDate(1)} id="attendance-next-day" title="Next Day">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 max-w-[400px] w-full">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-3 pl-11 pr-4 bg-bg-card border border-border-color rounded-md text-text-primary text-[0.9rem] hover:border-border-color/60 focus:border-primary-purple focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] transition-all duration-200 focus:outline-none placeholder:text-text-muted"
          id="attendance-search-input"
        />
      </div>

      {/* Admin Attendance Table */}
      <div className="bg-bg-card border border-border-color rounded-2xl overflow-hidden shadow-card">
        <table className="w-full border-collapse" id="admin-attendance-table">
          <thead>
            <tr className="bg-primary-purple/6">
              <th className="px-5 py-3.5 text-left text-[0.8rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Employee</th>
              <th className="px-5 py-3.5 text-left text-[0.8rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Check In</th>
              <th className="px-5 py-3.5 text-left text-[0.8rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Check Out</th>
              <th className="px-5 py-3.5 text-left text-[0.8rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Work Hours</th>
              <th className="px-5 py-3.5 text-left text-[0.8rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Extra Hours</th>
              <th className="px-5 py-3.5 text-left text-[0.8rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Status</th>
            </tr>
          </thead>
          <tbody>
            {loadingAdmin ? (
              <tr><td colSpan="6" className="text-center py-10 px-5 text-text-muted italic">Loading…</td></tr>
            ) : adminLogs.length > 0 ? (
              adminLogs.map((log, idx) => (
                <tr key={idx} className="transition-colors duration-200 hover:bg-primary-purple/4">
                  <td className="px-5 py-3.5 text-[0.9rem] text-text-primary border-b border-border-color/30">
                    <div className="flex items-center gap-3">
                      {log.profile_picture ? (
                        <img src={log.profile_picture} alt={log.first_name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold text-[0.75rem] shrink-0">
                          {getInitials(log.first_name, log.last_name)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary text-[0.9rem]">{log.first_name} {log.last_name}</span>
                        <span className="text-[0.78rem] text-text-muted">{log.department || ''}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[0.9rem] text-text-primary border-b border-border-color/30">
                    <span className="inline-block px-3 py-1 rounded-full text-[0.85rem] font-semibold tabular-nums bg-status-success/10 text-status-success">{log.check_in || '--:--'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[0.9rem] text-text-primary border-b border-border-color/30">
                    <span className="inline-block px-3 py-1 rounded-full text-[0.85rem] font-semibold tabular-nums bg-status-error/10 text-status-error">{log.check_out || '--:--'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[0.9rem] text-text-primary border-b border-border-color/30"><span className="font-semibold tabular-nums text-text-primary">{formatWorkHours(log.work_hours)}</span></td>
                  <td className="px-5 py-3.5 text-[0.9rem] text-text-primary border-b border-border-color/30">
                    <span className={`tabular-nums ${log.work_hours > 8 ? 'text-status-success font-semibold' : 'text-text-muted'}`}>
                      {formatExtraHours(log.work_hours)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[0.9rem] text-text-primary border-b border-border-color/30">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[12px] font-semibold capitalize ${
                      log.status === 'present' ? 'bg-status-success/15 text-status-success' :
                      log.status === 'leave' ? 'bg-status-info/15 text-status-info' : 'bg-status-error/15 text-status-error'
                    }`}>
                      {log.status || 'absent'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-10 px-5 text-text-muted italic border-b border-border-color/30">
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
    <div className="min-h-screen bg-bg-dark">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {isAdmin ? renderAdminView() : renderEmployeeView()}
      </main>
    </div>
  )
}

export default Attendance

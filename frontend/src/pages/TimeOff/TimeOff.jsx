import { useState, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar/Navbar'
import './TimeOff.css'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const LEAVE_TYPES = ['Paid Leave', 'Sick Leave', 'Unpaid Leave']

function TimeOff() {
  const {
    user,
    employees,
    leaveRequests,
    applyLeave,
    updateLeaveStatus,
    getEmployeeLeaves,
    getPendingLeaves,
    getAllLeaves,
    getEmployeeAttendance,
  } = useAuth()

  const isAdmin = user?.role === 'HR'

  // ===== Employee: Apply Leave Form =====
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'Paid Leave',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [formError, setFormError] = useState('')

  // ===== Calendar State =====
  const [calMonth, setCalMonth] = useState(9) // October
  const [calYear, setCalYear] = useState(2025)

  // ===== Admin: Approval =====
  const [approvalComment, setApprovalComment] = useState({})
  const [adminFilter, setAdminFilter] = useState('all') // 'all', 'pending', 'approved', 'rejected'

  // ===== Employee Leave History =====
  const myLeaves = useMemo(() => {
    if (!user) return []
    return getEmployeeLeaves(user.id)
  }, [user, getEmployeeLeaves])

  // ===== Admin Data =====
  const pendingLeaves = useMemo(() => getPendingLeaves(), [getPendingLeaves])

  const allLeaves = useMemo(() => {
    const leaves = getAllLeaves()
    if (adminFilter === 'all') return leaves
    return leaves.filter((l) => l.status === adminFilter)
  }, [adminFilter, getAllLeaves])

  // ===== Calendar Data =====
  const calendarData = useMemo(() => {
    if (!user) return {}

    const data = {}
    const logs = getEmployeeAttendance(user.id, calMonth, calYear)

    // Mark present days
    logs.forEach((log) => {
      const day = new Date(log.date).getDate()
      data[day] = 'present'
    })

    // Mark leave days (approved)
    const empLeaves = leaveRequests.filter(
      (lr) => lr.employeeId === user.id && lr.status === 'approved'
    )

    empLeaves.forEach((lr) => {
      const start = new Date(lr.startDate)
      const end = new Date(lr.endDate)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
          data[d.getDate()] = 'leave'
        }
      }
    })

    return data
  }, [user, calMonth, calYear, leaveRequests, getEmployeeAttendance])

  // ===== Handlers =====
  const handleApplyLeave = (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.startDate || !formData.endDate) {
      setFormError('Please select start and end dates.')
      return
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setFormError('End date must be after start date.')
      return
    }
    if (!formData.reason.trim()) {
      setFormError('Please provide a reason for leave.')
      return
    }

    // Calculate days
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    let days = 0
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) days++
    }

    applyLeave({
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days,
      reason: formData.reason.trim(),
    })

    setFormData({ type: 'Paid Leave', startDate: '', endDate: '', reason: '' })
    setShowForm(false)
  }

  const handleApprove = (requestId) => {
    const comment = approvalComment[requestId] || ''
    updateLeaveStatus(requestId, 'approved', comment)
    setApprovalComment((prev) => ({ ...prev, [requestId]: '' }))
  }

  const handleReject = (requestId) => {
    const comment = approvalComment[requestId] || ''
    updateLeaveStatus(requestId, 'rejected', comment)
    setApprovalComment((prev) => ({ ...prev, [requestId]: '' }))
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'timeoff-status--approved'
      case 'rejected':
        return 'timeoff-status--rejected'
      case 'pending':
        return 'timeoff-status--pending'
      default:
        return ''
    }
  }

  const getLeaveTypeClass = (type) => {
    switch (type) {
      case 'Paid Leave':
        return 'timeoff-type--paid'
      case 'Sick Leave':
        return 'timeoff-type--sick'
      case 'Unpaid Leave':
        return 'timeoff-type--unpaid'
      default:
        return ''
    }
  }

  // ===== Calendar Rendering =====
  const renderCalendar = () => {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const firstDay = new Date(calYear, calMonth, 1).getDay() // 0=Sun
    const days = []

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="timeoff-cal-day timeoff-cal-day--empty"
        ></div>
      )
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = new Date(calYear, calMonth, d).getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const status = calendarData[d] || (isWeekend ? 'weekend' : 'absent')

      days.push(
        <div
          key={d}
          className={`timeoff-cal-day timeoff-cal-day--${status}`}
          title={status.charAt(0).toUpperCase() + status.slice(1)}
        >
          {d}
        </div>
      )
    }

    return days
  }

  const getInitials = (name) => {
    if (!name) return '??'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // ===== EMPLOYEE VIEW =====
  const renderEmployeeView = () => (
    <div className="timeoff-employee" id="timeoff-employee-view">
      {/* Header with Apply Button */}
      <div className="timeoff-header">
        <h2 className="timeoff-title">Time Off</h2>
        <button
          className="timeoff-apply-btn"
          onClick={() => setShowForm(!showForm)}
          id="timeoff-apply-btn"
        >
          {showForm ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Apply for Leave
            </>
          )}
        </button>
      </div>

      {/* Apply Leave Form */}
      {showForm && (
        <div className="timeoff-form-card" id="timeoff-apply-form">
          <h3 className="timeoff-form-title">New Leave Request</h3>
          <form onSubmit={handleApplyLeave}>
            <div className="timeoff-form-grid">
              <div className="timeoff-form-group">
                <label htmlFor="leave-type">Leave Type</label>
                <select
                  id="leave-type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="timeoff-form-input"
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="timeoff-form-group">
                <label htmlFor="leave-start">Start Date</label>
                <input
                  id="leave-start"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="timeoff-form-input"
                />
              </div>
              <div className="timeoff-form-group">
                <label htmlFor="leave-end">End Date</label>
                <input
                  id="leave-end"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="timeoff-form-input"
                />
              </div>
            </div>
            <div className="timeoff-form-group" style={{ marginTop: '16px' }}>
              <label htmlFor="leave-reason">Reason / Comments</label>
              <textarea
                id="leave-reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                className="timeoff-form-input timeoff-form-textarea"
                placeholder="Please provide a reason for your leave request..."
                rows="3"
              />
            </div>
            {formError && <p className="timeoff-form-error">{formError}</p>}
            <button
              type="submit"
              className="timeoff-form-submit"
              id="timeoff-submit-btn"
            >
              Submit Request
            </button>
          </form>
        </div>
      )}

      {/* Calendar + History Layout */}
      <div className="timeoff-content-grid">
        {/* Calendar */}
        <div className="timeoff-calendar-card" id="timeoff-calendar">
          <div className="timeoff-calendar-header">
            <button
              className="timeoff-cal-nav-btn"
              onClick={() => {
                if (calMonth === 0) {
                  setCalMonth(11)
                  setCalYear(calYear - 1)
                } else setCalMonth(calMonth - 1)
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="timeoff-calendar-month">
              {MONTHS[calMonth]} {calYear}
            </span>
            <button
              className="timeoff-cal-nav-btn"
              onClick={() => {
                if (calMonth === 11) {
                  setCalMonth(0)
                  setCalYear(calYear + 1)
                } else setCalMonth(calMonth + 1)
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <div className="timeoff-cal-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="timeoff-cal-weekday">
                {d}
              </div>
            ))}
          </div>
          <div className="timeoff-cal-grid">{renderCalendar()}</div>
          <div className="timeoff-cal-legend">
            <div className="timeoff-cal-legend-item">
              <span className="timeoff-cal-legend-dot timeoff-cal-legend-dot--present"></span>
              Present
            </div>
            <div className="timeoff-cal-legend-item">
              <span className="timeoff-cal-legend-dot timeoff-cal-legend-dot--leave"></span>
              Leave
            </div>
            <div className="timeoff-cal-legend-item">
              <span className="timeoff-cal-legend-dot timeoff-cal-legend-dot--absent"></span>
              Absent
            </div>
            <div className="timeoff-cal-legend-item">
              <span className="timeoff-cal-legend-dot timeoff-cal-legend-dot--weekend"></span>
              Weekend
            </div>
          </div>
        </div>

        {/* Leave History */}
        <div className="timeoff-history-card" id="timeoff-history">
          <h3 className="timeoff-history-title">My Leave History</h3>
          {myLeaves.length > 0 ? (
            <div className="timeoff-history-list">
              {myLeaves.map((lr) => (
                <div key={lr.id} className="timeoff-history-item">
                  <div className="timeoff-history-item__top">
                    <span
                      className={`timeoff-type-badge ${getLeaveTypeClass(lr.type)}`}
                    >
                      {lr.type}
                    </span>
                    <span
                      className={`timeoff-status-badge ${getStatusClass(lr.status)}`}
                    >
                      {lr.status.charAt(0).toUpperCase() + lr.status.slice(1)}
                    </span>
                  </div>
                  <div className="timeoff-history-item__dates">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {lr.startDate} → {lr.endDate} ({lr.days} day
                    {lr.days > 1 ? 's' : ''})
                  </div>
                  <p className="timeoff-history-item__reason">{lr.reason}</p>
                  {lr.approverComment && (
                    <p className="timeoff-history-item__comment">
                      <strong>Admin:</strong> {lr.approverComment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="timeoff-empty-msg">No leave requests found.</p>
          )}
        </div>
      </div>
    </div>
  )

  // ===== ADMIN VIEW =====
  const renderAdminView = () => (
    <div className="timeoff-admin" id="timeoff-admin-view">
      <div className="timeoff-header">
        <h2 className="timeoff-title">Leave Management</h2>
        <div className="timeoff-admin-filters">
          {['all', 'pending', 'approved', 'rejected'].map((filter) => (
            <button
              key={filter}
              className={`timeoff-filter-btn ${adminFilter === filter ? 'timeoff-filter-btn--active' : ''}`}
              onClick={() => setAdminFilter(filter)}
              id={`timeoff-filter-${filter}`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter === 'pending' && pendingLeaves.length > 0 && (
                <span className="timeoff-filter-badge">
                  {pendingLeaves.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="timeoff-admin-table-container">
        <table className="timeoff-admin-table" id="admin-leave-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>Duration</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allLeaves.length > 0 ? (
              allLeaves.map((lr) => {
                const emp = employees.find((e) => e.id === lr.employeeId)
                return (
                  <tr
                    key={lr.id}
                    className={
                      lr.status === 'pending' ? 'timeoff-row--pending' : ''
                    }
                  >
                    <td>
                      <div className="timeoff-emp-cell">
                        {emp?.profilePicture ? (
                          <img
                            src={emp.profilePicture}
                            alt={emp?.name}
                            className="timeoff-emp-avatar"
                          />
                        ) : (
                          <div className="timeoff-emp-avatar-placeholder">
                            {getInitials(emp?.name || lr.employeeName)}
                          </div>
                        )}
                        <div className="timeoff-emp-info">
                          <span className="timeoff-emp-name">
                            {lr.employeeName}
                          </span>
                          <span className="timeoff-emp-dept">
                            {emp?.department || ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`timeoff-type-badge ${getLeaveTypeClass(lr.type)}`}
                      >
                        {lr.type}
                      </span>
                    </td>
                    <td className="timeoff-dates-cell">
                      {lr.startDate} → {lr.endDate}
                    </td>
                    <td>
                      <span className="timeoff-days-badge">{lr.days}</span>
                    </td>
                    <td className="timeoff-reason-cell">{lr.reason}</td>
                    <td>
                      <span
                        className={`timeoff-status-badge ${getStatusClass(lr.status)}`}
                      >
                        {lr.status.charAt(0).toUpperCase() + lr.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {lr.status === 'pending' ? (
                        <div className="timeoff-actions">
                          <input
                            type="text"
                            placeholder="Comment..."
                            value={approvalComment[lr.id] || ''}
                            onChange={(e) =>
                              setApprovalComment((prev) => ({
                                ...prev,
                                [lr.id]: e.target.value,
                              }))
                            }
                            className="timeoff-action-comment"
                          />
                          <div className="timeoff-action-btns">
                            <button
                              className="timeoff-action-btn timeoff-action-btn--approve"
                              onClick={() => handleApprove(lr.id)}
                              title="Approve"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                            <button
                              className="timeoff-action-btn timeoff-action-btn--reject"
                              onClick={() => handleReject(lr.id)}
                              title="Reject"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="timeoff-action-done">
                          {lr.approverComment || '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="7" className="timeoff-table-empty">
                  No leave requests found for the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="timeoff-page">
      <Navbar />
      <main className="timeoff-main">
        {isAdmin ? renderAdminView() : renderEmployeeView()}
      </main>
    </div>
  )
}

export default TimeOff

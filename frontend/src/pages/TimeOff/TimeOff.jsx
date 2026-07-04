import { useState, useMemo, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useMyLeaves, useApplyLeave, useAdminLeaves, useApproveOrRejectLeave } from '../../hooks/useLeaveApi'
import Navbar from '../../components/Navbar/Navbar'
import './TimeOff.css'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const LEAVE_TYPES = ['Paid Time Off', 'Sick Leave', 'Unpaid Leaves']

function TimeOff() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const attachmentRef = useRef(null)

  const now = new Date()

  // ===== Employee: Apply Leave Form =====
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ type: 'Paid Time Off', startDate: '', endDate: '', remarks: '' })
  const [attachmentFile, setAttachmentFile] = useState(null)
  const [formError, setFormError] = useState('')

  // ===== Calendar State =====
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [calYear, setCalYear] = useState(now.getFullYear())

  // ===== Admin: Approval =====
  const [approvalComment, setApprovalComment] = useState({})
  const [adminFilter, setAdminFilter] = useState('all')

  // ─── TanStack Query hooks ──────────────────────────────────────────────────
  const { data: myLeavesData, isLoading: loadingMyLeaves } = useMyLeaves({ enabled: !isAdmin && !!user })
  const { data: adminLeavesData, isLoading: loadingAdminLeaves } = useAdminLeaves({ enabled: isAdmin })

  const applyLeaveMutation = useApplyLeave({
    onSuccess: () => {
      setShowForm(false)
      setFormData({ type: 'Paid Time Off', startDate: '', endDate: '', remarks: '' })
      setAttachmentFile(null)
      setFormError('')
    },
    onError: (err) => {
      setFormError(err?.response?.data?.message || 'Failed to submit leave request.')
    },
  })

  const approveRejectMutation = useApproveOrRejectLeave({
    onSuccess: () => setApprovalComment({}),
    onError: (err) => alert(err?.response?.data?.message || 'Action failed.'),
  })

  // ─── Derived data ──────────────────────────────────────────────────────────
  const myLeaves = myLeavesData?.leaves || []
  const balances = myLeavesData?.balances || { paid: 0, sick: 0 }

  const allAdminLeaves = adminLeavesData?.data || []
  const pendingCount = allAdminLeaves.filter((l) => l.status === 'pending').length

  const filteredAdminLeaves = useMemo(() => {
    if (adminFilter === 'all') return allAdminLeaves
    return allAdminLeaves.filter((l) => l.status === adminFilter)
  }, [allAdminLeaves, adminFilter])

  // ─── Calendar data (from approved leaves) ─────────────────────────────────
  const calendarData = useMemo(() => {
    const data = {}
    myLeaves
      .filter((lr) => lr.status === 'approved')
      .forEach((lr) => {
        const start = new Date(lr.start_date + 'T00:00:00')
        const end = new Date(lr.end_date + 'T00:00:00')
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
            data[d.getDate()] = 'leave'
          }
        }
      })
    return data
  }, [myLeaves, calMonth, calYear])

  // ─── Handlers ─────────────────────────────────────────────────────────────
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
    if (!formData.remarks.trim()) {
      setFormError('Please provide a reason for leave.')
      return
    }

    const fd = new FormData()
    fd.append('leave_type', formData.type)
    fd.append('start_date', formData.startDate)
    fd.append('end_date', formData.endDate)
    fd.append('remarks', formData.remarks)
    if (attachmentFile) fd.append('attachment', attachmentFile)

    applyLeaveMutation.mutate(fd)
  }

  const handleApprove = (id) => {
    approveRejectMutation.mutate({ id, status: 'approved', admin_comment: approvalComment[id] || '' })
    setApprovalComment((prev) => ({ ...prev, [id]: '' }))
  }

  const handleReject = (id) => {
    approveRejectMutation.mutate({ id, status: 'rejected', admin_comment: approvalComment[id] || '' })
    setApprovalComment((prev) => ({ ...prev, [id]: '' }))
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return 'timeoff-status--approved'
      case 'rejected': return 'timeoff-status--rejected'
      case 'pending':  return 'timeoff-status--pending'
      default:         return ''
    }
  }

  const getLeaveTypeClass = (type) => {
    if (!type) return ''
    const t = type.toLowerCase()
    if (t.includes('paid')) return 'timeoff-type--paid'
    if (t.includes('sick')) return 'timeoff-type--sick'
    if (t.includes('unpaid')) return 'timeoff-type--unpaid'
    return ''
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return dateStr.split('T')[0]
  }

  // ===== Calendar Rendering =====
  const renderCalendar = () => {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="timeoff-cal-day timeoff-cal-day--empty"></div>)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = new Date(calYear, calMonth, d).getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const status = calendarData[d] || (isWeekend ? 'weekend' : 'absent')
      days.push(
        <div key={d} className={`timeoff-cal-day timeoff-cal-day--${status}`} title={status.charAt(0).toUpperCase() + status.slice(1)}>
          {d}
        </div>
      )
    }
    return days
  }

  const getInitials = (firstName, lastName) => {
    const f = (firstName || '')[0] || ''
    const l = (lastName || '')[0] || ''
    return (f + l).toUpperCase() || '??'
  }

  // ===== EMPLOYEE VIEW =====
  const renderEmployeeView = () => (
    <div className="timeoff-employee" id="timeoff-employee-view">
      {/* Header with Apply Button */}
      <div className="timeoff-header">
        <div>
          <h2 className="timeoff-title">Time Off</h2>
          {/* Leave balance pills */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 600 }}>
              🟣 Paid Leave: {balances.paid} days
            </span>
            <span style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c', padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 600 }}>
              🟠 Sick Leave: {balances.sick} days
            </span>
          </div>
        </div>
        <button className="timeoff-apply-btn" onClick={() => setShowForm(!showForm)} id="timeoff-apply-btn">
          {showForm ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
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
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="timeoff-form-input"
                >
                  {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="timeoff-form-group">
                <label htmlFor="leave-start">Start Date</label>
                <input id="leave-start" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="timeoff-form-input" />
              </div>
              <div className="timeoff-form-group">
                <label htmlFor="leave-end">End Date</label>
                <input id="leave-end" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="timeoff-form-input" />
              </div>
            </div>
            <div className="timeoff-form-group" style={{ marginTop: '16px' }}>
              <label htmlFor="leave-reason">Reason / Comments</label>
              <textarea
                id="leave-reason"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="timeoff-form-input timeoff-form-textarea"
                placeholder="Please provide a reason for your leave request..."
                rows="3"
              />
            </div>
            {formData.type === 'Sick Leave' && (
              <div className="timeoff-form-group" style={{ marginTop: '16px' }}>
                <label htmlFor="leave-attachment">Medical Certificate (required for Sick Leave)</label>
                <input
                  id="leave-attachment"
                  type="file"
                  ref={attachmentRef}
                  accept="image/*,application/pdf"
                  onChange={(e) => setAttachmentFile(e.target.files[0] || null)}
                  className="timeoff-form-input"
                />
              </div>
            )}
            {formError && <p className="timeoff-form-error">{formError}</p>}
            <button
              type="submit"
              className="timeoff-form-submit"
              id="timeoff-submit-btn"
              disabled={applyLeaveMutation.isPending}
            >
              {applyLeaveMutation.isPending ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {/* Calendar + History Layout */}
      <div className="timeoff-content-grid">
        {/* Calendar */}
        <div className="timeoff-calendar-card" id="timeoff-calendar">
          <div className="timeoff-calendar-header">
            <button className="timeoff-cal-nav-btn" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) } else setCalMonth(calMonth - 1) }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="timeoff-calendar-month">{MONTHS[calMonth]} {calYear}</span>
            <button className="timeoff-cal-nav-btn" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) } else setCalMonth(calMonth + 1) }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
          <div className="timeoff-cal-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="timeoff-cal-weekday">{d}</div>
            ))}
          </div>
          <div className="timeoff-cal-grid">{renderCalendar()}</div>
          <div className="timeoff-cal-legend">
            <div className="timeoff-cal-legend-item"><span className="timeoff-cal-legend-dot timeoff-cal-legend-dot--present"></span>Present</div>
            <div className="timeoff-cal-legend-item"><span className="timeoff-cal-legend-dot timeoff-cal-legend-dot--leave"></span>Leave</div>
            <div className="timeoff-cal-legend-item"><span className="timeoff-cal-legend-dot timeoff-cal-legend-dot--absent"></span>Absent</div>
            <div className="timeoff-cal-legend-item"><span className="timeoff-cal-legend-dot timeoff-cal-legend-dot--weekend"></span>Weekend</div>
          </div>
        </div>

        {/* Leave History */}
        <div className="timeoff-history-card" id="timeoff-history">
          <h3 className="timeoff-history-title">My Leave History</h3>
          {loadingMyLeaves ? (
            <p className="timeoff-empty-msg">Loading…</p>
          ) : myLeaves.length > 0 ? (
            <div className="timeoff-history-list">
              {myLeaves.map((lr) => (
                <div key={lr.id} className="timeoff-history-item">
                  <div className="timeoff-history-item__top">
                    <span className={`timeoff-type-badge ${getLeaveTypeClass(lr.leave_type)}`}>
                      {lr.leave_type}
                    </span>
                    <span className={`timeoff-status-badge ${getStatusClass(lr.status)}`}>
                      {lr.status.charAt(0).toUpperCase() + lr.status.slice(1)}
                    </span>
                  </div>
                  <div className="timeoff-history-item__dates">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {formatDate(lr.start_date)} → {formatDate(lr.end_date)} ({lr.days_requested} day{lr.days_requested > 1 ? 's' : ''})
                  </div>
                  <p className="timeoff-history-item__reason">{lr.remarks}</p>
                  {lr.admin_comment && (
                    <p className="timeoff-history-item__comment">
                      <strong>Admin:</strong> {lr.admin_comment}
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
              {filter === 'pending' && pendingCount > 0 && (
                <span className="timeoff-filter-badge">{pendingCount}</span>
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
            {loadingAdminLeaves ? (
              <tr><td colSpan="7" className="timeoff-table-empty">Loading…</td></tr>
            ) : filteredAdminLeaves.length > 0 ? (
              filteredAdminLeaves.map((lr) => (
                <tr key={lr.id} className={lr.status === 'pending' ? 'timeoff-row--pending' : ''}>
                  <td>
                    <div className="timeoff-emp-cell">
                      <div className="timeoff-emp-avatar-placeholder">
                        {getInitials(lr.first_name, lr.last_name)}
                      </div>
                      <div className="timeoff-emp-info">
                        <span className="timeoff-emp-name">{lr.first_name} {lr.last_name}</span>
                        <span className="timeoff-emp-dept">{lr.employee_id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`timeoff-type-badge ${getLeaveTypeClass(lr.leave_type)}`}>
                      {lr.leave_type}
                    </span>
                  </td>
                  <td className="timeoff-dates-cell">{formatDate(lr.start_date)} → {formatDate(lr.end_date)}</td>
                  <td><span className="timeoff-days-badge">{lr.days_requested}</span></td>
                  <td className="timeoff-reason-cell">{lr.remarks}</td>
                  <td>
                    <span className={`timeoff-status-badge ${getStatusClass(lr.status)}`}>
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
                          onChange={(e) => setApprovalComment((prev) => ({ ...prev, [lr.id]: e.target.value }))}
                          className="timeoff-action-comment"
                        />
                        <div className="timeoff-action-btns">
                          <button
                            className="timeoff-action-btn timeoff-action-btn--approve"
                            onClick={() => handleApprove(lr.id)}
                            title="Approve"
                            disabled={approveRejectMutation.isPending}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                          <button
                            className="timeoff-action-btn timeoff-action-btn--reject"
                            onClick={() => handleReject(lr.id)}
                            title="Reject"
                            disabled={approveRejectMutation.isPending}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="timeoff-action-done">{lr.admin_comment || '—'}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="timeoff-table-empty">No leave requests found for the selected filter.</td>
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

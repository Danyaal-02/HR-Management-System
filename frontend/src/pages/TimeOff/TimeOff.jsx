import { useState, useMemo, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useMyLeaves, useApplyLeave, useAdminLeaves, useApproveOrRejectLeave } from '../../hooks/useLeaveApi'
import Navbar from '../../components/Navbar/Navbar'

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
    if (formData.type === 'Sick Leave' && !attachmentFile) {
      setFormError('Medical certificate is required for Sick Leave.')
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
      case 'approved': return 'bg-status-success/12 text-status-success'
      case 'rejected': return 'bg-status-error/12 text-status-error'
      case 'pending':  return 'bg-status-warning/12 text-status-warning'
      default:         return ''
    }
  }

  const getLeaveTypeClass = (type) => {
    if (!type) return ''
    const t = type.toLowerCase()
    if (t.includes('paid')) return 'bg-status-info/12 text-status-info'
    if (t.includes('sick')) return 'bg-status-warning/12 text-status-warning'
    if (t.includes('unpaid')) return 'bg-status-error/12 text-status-error'
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
      days.push(<div key={`empty-${i}`} className="aspect-square flex items-center justify-center text-[0.82rem] font-medium rounded-sm transition-all duration-200 cursor-default bg-transparent"></div>)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = new Date(calYear, calMonth, d).getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const status = calendarData[d] || (isWeekend ? 'weekend' : 'absent')
      let dayStatusClass = ''
      if (status === 'present') {
        dayStatusClass = 'bg-status-success/15 text-status-success font-semibold'
      } else if (status === 'leave') {
        dayStatusClass = 'bg-status-warning/15 text-status-warning font-semibold'
      } else if (status === 'absent') {
        dayStatusClass = 'bg-status-error/8 text-text-muted'
      } else if (status === 'weekend') {
        dayStatusClass = 'bg-text-muted/8 text-text-muted opacity-60'
      }

      days.push(
        <div key={d} className={`aspect-square flex items-center justify-center text-[0.82rem] font-medium rounded-sm transition-all duration-200 cursor-default ${dayStatusClass}`} title={status.charAt(0).toUpperCase() + status.slice(1)}>
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
    <div className="flex flex-col gap-6" id="timeoff-employee-view">
      {/* Header with Apply Button */}
      <div className="flex items-center justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Time Off</h2>
          {/* Leave balance pills */}
          <div className="flex gap-3 mt-2 flex-wrap">
            <span className="bg-primary-purple/15 text-primary-purple px-3 py-1 rounded-full text-[13px] font-semibold">
              🟣 Paid Leave: {balances.paid} days
            </span>
            <span className="bg-[#fb923c]/15 text-[#fb923c] px-3 py-1 rounded-full text-[13px] font-semibold">
              🟠 Sick Leave: {balances.sick} days
            </span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-primary text-white rounded-md font-semibold text-sm transition-all duration-200 shadow-button hover:-translate-y-0.5 hover:shadow-button-hover active:translate-y-0" onClick={() => setShowForm(!showForm)} id="timeoff-apply-btn">
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
        <div className="bg-bg-card border border-border-color rounded-lg p-7 mb-7 animate-slide-down" id="timeoff-apply-form">
          <h3 className="text-[1.1rem] font-semibold text-text-primary mb-5">New Leave Request</h3>
          <form onSubmit={handleApplyLeave}>
            <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary uppercase tracking-[0.5px]" htmlFor="leave-type">Leave Type</label>
                <select
                  id="leave-type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="bg-bg-input border border-border-color text-text-primary px-3.5 py-2.5 rounded-sm text-sm transition-all duration-200 focus:border-primary-purple focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] focus:outline-none"
                >
                  {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary uppercase tracking-[0.5px]" htmlFor="leave-start">Start Date</label>
                <input id="leave-start" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="bg-bg-input border border-border-color text-text-primary px-3.5 py-2.5 rounded-sm text-sm transition-all duration-200 focus:border-primary-purple focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.82rem] font-semibold text-text-secondary uppercase tracking-[0.5px]" htmlFor="leave-end">End Date</label>
                <input id="leave-end" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="bg-bg-input border border-border-color text-text-primary px-3.5 py-2.5 rounded-sm text-sm transition-all duration-200 focus:border-primary-purple focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] focus:outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-4">
              <label className="text-[0.82rem] font-semibold text-text-secondary uppercase tracking-[0.5px]" htmlFor="leave-reason">Reason / Comments</label>
              <textarea
                id="leave-reason"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="bg-bg-input border border-border-color text-text-primary px-3.5 py-2.5 rounded-sm text-sm transition-all duration-200 focus:border-primary-purple focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] focus:outline-none resize-y min-h-[80px]"
                placeholder="Please provide a reason for your leave request..."
                rows="3"
              />
            </div>
            {formData.type === 'Sick Leave' && (
              <div className="flex flex-col gap-1.5 mt-4">
                <label className="text-[0.82rem] font-semibold text-text-secondary uppercase tracking-[0.5px]" htmlFor="leave-attachment">Medical Certificate (required for Sick Leave)</label>
                <input
                  id="leave-attachment"
                  type="file"
                  ref={attachmentRef}
                  accept="image/*,application/pdf"
                  onChange={(e) => setAttachmentFile(e.target.files[0] || null)}
                  className="bg-bg-input border border-border-color text-text-primary px-3.5 py-2.5 rounded-sm text-sm transition-all duration-200 focus:border-primary-purple focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] focus:outline-none"
                />
              </div>
            )}
            {formError && <p className="text-status-error text-[0.85rem] mt-2.5">{formError}</p>}
            <button
              type="submit"
              className="mt-4 px-7 py-2.5 bg-gradient-primary text-white rounded-sm font-semibold text-sm transition-all duration-200 shadow-button hover:-translate-y-0.5 hover:shadow-button-hover active:translate-y-0 disabled:opacity-60"
              id="timeoff-submit-btn"
              disabled={applyLeaveMutation.isPending}
            >
              {applyLeaveMutation.isPending ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {/* Calendar + History Layout */}
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
        {/* Calendar */}
        <div className="bg-bg-card border border-border-color rounded-lg p-6" id="timeoff-calendar">
          <div className="flex items-center justify-between mb-5">
            <button className="w-8 h-8 flex items-center justify-center bg-bg-input border border-border-color rounded-sm text-text-secondary transition-all duration-200 hover:border-primary-purple hover:text-primary-purple" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) } else setCalMonth(calMonth - 1) }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="text-base font-bold text-text-primary">{MONTHS[calMonth]} {calYear}</span>
            <button className="w-8 h-8 flex items-center justify-center bg-bg-input border border-border-color rounded-sm text-text-secondary transition-all duration-200 hover:border-primary-purple hover:text-primary-purple" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) } else setCalMonth(calMonth + 1) }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-[0.72rem] font-semibold text-text-muted uppercase tracking-[0.5px] py-1.5">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
          <div className="flex gap-4 mt-4 pt-3.5 border-t border-border-color flex-wrap">
            <div className="flex items-center gap-1.5 text-[0.78rem] text-text-secondary"><span className="w-2.5 h-2.5 rounded-[3px] bg-status-success/50"></span>Present</div>
            <div className="flex items-center gap-1.5 text-[0.78rem] text-text-secondary"><span className="w-2.5 h-2.5 rounded-[3px] bg-status-warning/50"></span>Leave</div>
            <div className="flex items-center gap-1.5 text-[0.78rem] text-text-secondary"><span className="w-2.5 h-2.5 rounded-[3px] bg-status-error/30"></span>Absent</div>
            <div className="flex items-center gap-1.5 text-[0.78rem] text-text-secondary"><span className="w-2.5 h-2.5 rounded-[3px] bg-text-muted/30"></span>Weekend</div>
          </div>
        </div>

        {/* Leave History */}
        <div className="bg-bg-card border border-border-color rounded-lg p-6 max-h-[550px] overflow-y-auto scrollbar-thin scrollbar-thumb-border-color scrollbar-track-transparent" id="timeoff-history">
          <h3 className="text-base font-bold text-text-primary mb-4">My Leave History</h3>
          {loadingMyLeaves ? (
            <p className="text-text-muted italic text-center py-6">Loading…</p>
          ) : myLeaves.length > 0 ? (
            <div className="flex flex-col gap-3">
              {myLeaves.map((lr) => (
                <div key={lr.id} className="bg-bg-input border border-border-color rounded-md p-4 transition-all duration-200 hover:border-primary-purple/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getLeaveTypeClass(lr.leave_type)}`}>
                      {lr.leave_type}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusClass(lr.status)}`}>
                      {lr.status.charAt(0).toUpperCase() + lr.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[0.82rem] text-text-secondary mb-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {formatDate(lr.start_date)} → {formatDate(lr.end_date)} ({lr.days_requested} day{lr.days_requested > 1 ? 's' : ''})
                  </div>
                  <p className="text-[0.85rem] text-text-secondary leading-snug">{lr.remarks}</p>
                  {lr.admin_comment && (
                    <p className="text-[0.82rem] text-text-muted mt-2 pt-2 border-t border-border-color">
                      <strong>Admin:</strong> {lr.admin_comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted italic text-center py-6">No leave requests found.</p>
          )}
        </div>
      </div>
    </div>
  )

  // ===== ADMIN VIEW =====
  const renderAdminView = () => (
    <div className="flex flex-col gap-6" id="timeoff-admin-view">
      <div className="flex items-center justify-between gap-4 mb-7 flex-wrap">
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Leave Management</h2>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'rejected'].map((filter) => (
            <button
              key={filter}
              className={`${adminFilter === filter ? 'px-4 py-2 bg-primary-purple/10 border border-primary-purple rounded-md text-primary-purple text-[0.85rem] font-semibold transition-all duration-200 flex items-center gap-1.5' : 'px-4 py-2 bg-bg-card border border-border-color rounded-md text-text-secondary text-[0.85rem] font-medium transition-all duration-200 flex items-center gap-1.5 hover:border-primary-purple hover:text-text-primary'}`}
              onClick={() => setAdminFilter(filter)}
              id={`timeoff-filter-${filter}`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter === 'pending' && pendingCount > 0 && (
                <span className="bg-status-warning text-black text-[0.7rem] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-bg-card border border-border-color rounded-lg overflow-hidden">
        <table className="w-full border-collapse" id="admin-leave-table">
          <thead className="bg-primary-purple/6">
            <tr>
              <th className="px-4 py-3.5 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Employee</th>
              <th className="px-4 py-3.5 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Type</th>
              <th className="px-4 py-3.5 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Duration</th>
              <th className="px-4 py-3.5 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Days</th>
              <th className="px-4 py-3.5 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Reason</th>
              <th className="px-4 py-3.5 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Status</th>
              <th className="px-4 py-3.5 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-[0.6px] border-b border-border-color">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingAdminLeaves ? (
              <tr><td colSpan="7" className="text-center! py-10 px-4! text-text-muted! italic">Loading…</td></tr>
            ) : filteredAdminLeaves.length > 0 ? (
              filteredAdminLeaves.map((lr) => (
                <tr key={lr.id} className={`${lr.status === 'pending' ? 'bg-status-warning/3!' : ''} hover:bg-primary-purple/4 transition-colors duration-200`}>
                  <td className="px-4 py-3.5 text-[0.88rem] text-text-primary border-b border-border-color/50 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[34px] h-[34px] rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold text-[0.72rem] shrink-0">
                        {getInitials(lr.first_name, lr.last_name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[0.88rem]">{lr.first_name} {lr.last_name}</span>
                        <span className="text-[0.76rem] text-text-muted">{lr.employee_id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[0.88rem] text-text-primary border-b border-border-color/50 align-middle">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getLeaveTypeClass(lr.leave_type)}`}>
                      {lr.leave_type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[0.88rem] text-text-primary border-b border-border-color/50 align-middle tabular-nums text-[0.82rem]! whitespace-nowrap">{formatDate(lr.start_date)} → {formatDate(lr.end_date)}</td>
                  <td className="px-4 py-3.5 text-[0.88rem] text-text-primary border-b border-border-color/50 align-middle"><span className="inline-flex items-center justify-center min-width-[28px] h-6 px-2 bg-primary-purple/10 text-primary-purple rounded-full font-bold text-[0.82rem]">{lr.days_requested}</span></td>
                  <td className="px-4 py-3.5 text-[0.88rem] text-text-primary border-b border-border-color/50 align-middle max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{lr.remarks}</td>
                  <td className="px-4 py-3.5 text-[0.88rem] text-text-primary border-b border-border-color/50 align-middle">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusClass(lr.status)}`}>
                      {lr.status.charAt(0).toUpperCase() + lr.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[0.88rem] text-text-primary border-b border-border-color/50 align-middle">
                    {lr.status === 'pending' ? (
                      <div className="flex flex-col gap-2 min-w-[160px]">
                        <input
                          type="text"
                          placeholder="Comment..."
                          value={approvalComment[lr.id] || ''}
                          onChange={(e) => setApprovalComment((prev) => ({ ...prev, [lr.id]: e.target.value }))}
                          className="bg-bg-input border border-border-color text-text-primary px-2.5 py-1.5 rounded-sm text-[0.8rem] w-full focus:border-primary-purple focus:outline-none"
                        />
                        <div className="flex gap-1.5">
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded-sm border border-border-color transition-all duration-200 text-status-success bg-status-success/8 hover:bg-status-success/20 hover:border-status-success hover:scale-[1.1]"
                            onClick={() => handleApprove(lr.id)}
                            title="Approve"
                            disabled={approveRejectMutation.isPending}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded-sm border border-border-color transition-all duration-200 text-status-error bg-status-error/8 hover:bg-status-error/20 hover:border-status-error hover:scale-[1.1]"
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
                      <span className="text-[0.82rem] text-text-muted italic">{lr.admin_comment || '—'}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center! py-10 px-4! text-text-muted! italic">No leave requests found for the selected filter.</td>
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

export default TimeOff

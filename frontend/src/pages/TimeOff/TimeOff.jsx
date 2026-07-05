import { useState, useMemo, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useInView } from 'react-intersection-observer'
import { useMyLeaves, useApplyLeave, useAdminLeaves, useApproveOrRejectLeave } from '../../hooks/useLeaveApi'
import Navbar from '../../components/Navbar/Navbar'
import ConfirmationModal from '../../components/ConfirmationModal/ConfirmationModal'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

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
  const [modalState, setModalState] = useState({ isOpen: false, type: '', id: null })
  const [adminFilter, setAdminFilter] = useState('all')
  const [toastMessage, setToastMessage] = useState(null)

  // ===== Search, Sort State =====
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sorting, setSorting] = useState([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const sortBy = sorting.length > 0 ? sorting[0].id : undefined
  const sortDir = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined

  // ─── TanStack Query hooks ──────────────────────────────────────────────────
  const { 
    data: myLeavesData, 
    isLoading: loadingMyLeaves,
    fetchNextPage: fetchNextMyLeaves,
    hasNextPage: hasNextMyLeaves,
    isFetchingNextPage: isFetchingNextMyLeaves
  } = useMyLeaves(
    { sortBy, sortDir },
    { enabled: !isAdmin && !!user }
  )
  
  const { 
    data: adminLeavesData, 
    isLoading: loadingAdminLeaves,
    fetchNextPage: fetchNextAdminLeaves,
    hasNextPage: hasNextAdminLeaves,
    isFetchingNextPage: isFetchingNextAdminLeaves
  } = useAdminLeaves(
    { status: adminFilter, search: debouncedSearch, sortBy, sortDir },
    { enabled: isAdmin }
  )

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
    onSuccess: (data) => {
      setModalState({ isOpen: false, type: '', id: null })
      setToastMessage({ type: 'success', text: data?.message || 'Leave request updated successfully.' })
      setTimeout(() => setToastMessage(null), 3000)
    },
    onError: (err) => {
      setToastMessage({ type: 'error', text: err?.response?.data?.message || 'Action failed.' })
      setModalState({ isOpen: false, type: '', id: null })
      setTimeout(() => setToastMessage(null), 3000)
    },
  })

  // ─── Derived data ──────────────────────────────────────────────────────────
  const rawDataPages = isAdmin ? (adminLeavesData?.pages || []) : (myLeavesData?.pages || [])
  const data = useMemo(() => {
    return rawDataPages.flatMap(page => page.rows || page.data || page.leaves || [])
  }, [rawDataPages])

  const firstPage = rawDataPages[0] || {}
  const balances = firstPage.balances || { paid: 0, sick: 0 }
  
  const isLoading = isAdmin ? loadingAdminLeaves : loadingMyLeaves
  const hasNextPage = isAdmin ? hasNextAdminLeaves : hasNextMyLeaves
  const isFetchingNextPage = isAdmin ? isFetchingNextAdminLeaves : isFetchingNextMyLeaves
  const fetchNextPage = isAdmin ? fetchNextAdminLeaves : fetchNextMyLeaves

  // Intersection Observer for Infinite Scroll
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])


  // Calendar Data
  const calendarData = useMemo(() => {
    const calData = {}
    data
      .filter((lr) => lr.status === 'approved' && !isAdmin) // only apply to employee view
      .forEach((lr) => {
        const start = new Date(lr.start_date + 'T00:00:00')
        const end = new Date(lr.end_date + 'T00:00:00')
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
            calData[d.getDate()] = 'leave'
          }
        }
      })
    return calData
  }, [data, calMonth, calYear, isAdmin])

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

  const handleApprove = (id) => setModalState({ isOpen: true, type: 'approve', id })
  const handleReject = (id) => setModalState({ isOpen: true, type: 'reject', id })

  const handleConfirmModal = (comment) => {
    const { type, id } = modalState
    const status = type === 'approve' ? 'approved' : 'rejected'
    approveRejectMutation.mutate({ id, status, admin_comment: comment })
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
  
  const getInitials = (firstName, lastName) => {
    const f = (firstName || '')[0] || ''
    const l = (lastName || '')[0] || ''
    return (f + l).toUpperCase() || '??'
  }

  // ===== Columns =====
  const columns = useMemo(() => {
    const cols = []
    
    if (isAdmin) {
      cols.push({
        id: 'name',
        header: 'Employee',
        accessorFn: row => `${row.first_name} ${row.last_name}`,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold text-[0.72rem] shrink-0">
              {getInitials(row.original.first_name, row.original.last_name)}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[0.88rem] text-text-primary">{row.original.first_name} {row.original.last_name}</span>
              <span className="text-[0.76rem] text-text-muted">{row.original.employee_id}</span>
            </div>
          </div>
        )
      })
    }

    cols.push(
      {
        id: 'leave_type',
        header: 'Type',
        accessorKey: 'leave_type',
        cell: ({ getValue }) => (
          <span className={`px-2.5 py-0.5 rounded-full text-[0.75rem] font-semibold ${getLeaveTypeClass(getValue())}`}>
            {getValue()}
          </span>
        )
      },
      {
        id: 'start_date',
        header: 'Duration',
        accessorFn: row => `${formatDate(row.start_date)} → ${formatDate(row.end_date)}`,
        cell: ({ getValue }) => <span className="font-semibold tabular-nums text-[0.82rem] whitespace-nowrap">{getValue()}</span>
      },
      {
        id: 'days',
        header: 'Days',
        accessorKey: 'days_requested',
        cell: ({ getValue }) => (
          <span className="inline-flex items-center justify-center min-w-[28px] h-6 bg-primary-purple/10 text-primary-purple rounded-full font-bold text-[0.82rem]">
            {getValue()}
          </span>
        )
      },
      {
        id: 'remarks',
        header: 'Reason',
        accessorKey: 'remarks',
        enableSorting: false,
        cell: ({ row }) => {
          const text = row.original.remarks || ''
          return (
            <div className="flex flex-col gap-1 max-w-[200px]">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.88rem]" title={text}>{text}</span>
              {row.original.admin_comment && (
                <span className="text-[0.75rem] text-text-muted italic" title={row.original.admin_comment}>
                  Admin: {row.original.admin_comment}
                </span>
              )}
            </div>
          )
        }
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const s = getValue() || 'pending'
          return (
            <span className={`px-2.5 py-0.5 rounded-full text-[0.75rem] font-semibold ${getStatusClass(s)}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          )
        }
      }
    )

    if (isAdmin) {
      cols.push({
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const lr = row.original
          if (lr.status === 'pending') {
            return (
              <div className="flex flex-col gap-2 min-w-[90px]">
                <div className="flex gap-1.5">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-sm border border-border-color text-status-success bg-status-success/8 hover:bg-status-success/20 hover:border-status-success hover:scale-110 transition-all duration-200 cursor-pointer"
                    onClick={() => handleApprove(lr.id)}
                    title="Approve"
                    disabled={approveRejectMutation.isPending}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-sm border border-border-color text-status-error bg-status-error/8 hover:bg-status-error/20 hover:border-status-error hover:scale-110 transition-all duration-200 cursor-pointer"
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
            )
          }
          return <span className="text-[0.82rem] text-text-muted italic">{lr.admin_comment || '—'}</span>
        }
      })
    }
    
    return cols
  }, [isAdmin, approveRejectMutation.isPending])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  })

  // ===== Calendar Rendering =====
  const renderCalendar = () => {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square flex items-center justify-center bg-transparent"></div>)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = new Date(calYear, calMonth, d).getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const status = calendarData[d] || (isWeekend ? 'weekend' : 'absent')
      
      let dayBgClass = 'bg-transparent'
      if (status === 'present') dayBgClass = 'bg-status-success/15 text-status-success font-semibold'
      else if (status === 'leave') dayBgClass = 'bg-status-warning/15 text-status-warning font-semibold'
      else if (status === 'absent') dayBgClass = 'bg-status-error/8 text-text-muted'
      else if (status === 'weekend') dayBgClass = 'bg-[rgba(107,107,128,0.08)] text-text-muted opacity-60'

      days.push(
        <div key={d} className={`aspect-square flex items-center justify-center text-[0.82rem] font-medium rounded-sm transition-all duration-200 cursor-default ${dayBgClass}`} title={status.charAt(0).toUpperCase() + status.slice(1)}>
          {d}
        </div>
      )
    }
    return days
  }

  // ===== EMPLOYEE VIEW =====
  const renderEmployeeView = () => (
    <div className="flex flex-col gap-6" id="timeoff-employee-view">
      {/* Header with Apply Button */}
      <div className="flex items-center justify-between mb-7 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Time Off</h2>
          <div className="flex gap-3 mt-2 flex-wrap">
            <span className="bg-primary-purple/15 text-primary-purple px-3 py-1 rounded-full text-[13px] font-semibold">
              🟣 Paid Leave: {balances.paid} days
            </span>
            <span className="bg-status-warning/15 text-status-warning px-3 py-1 rounded-full text-[13px] font-semibold">
              乘 Sick Leave: {balances.sick} days
            </span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-primary text-white rounded-md font-semibold text-[0.9rem] transition-all duration-200 shadow-button hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 cursor-pointer" onClick={() => setShowForm(!showForm)}>
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
        <div className="bg-bg-card border border-border-color rounded-lg p-7 mb-7 animate-[slideDown_0.3s_ease-out]">
          <h3 className="text-[1.1rem] font-semibold text-text-primary mb-5">New Leave Request</h3>
          <form onSubmit={handleApplyLeave}>
            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="leave-type" className="text-[0.82rem] font-semibold text-text-secondary uppercase tracking-[0.5px]">Leave Type</label>
                <select
                  id="leave-type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="bg-bg-input border border-border-color text-text-primary px-3.5 py-2.5 rounded-sm text-[0.9rem] focus:border-primary-purple outline-none transition-all duration-200 cursor-pointer"
                >
                  {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="leave-start" className="text-[0.82rem] font-semibold text-text-secondary uppercase tracking-[0.5px]">Start Date</label>
                <input id="leave-start" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="bg-bg-input border border-border-color text-text-primary px-3.5 py-2.5 rounded-sm text-[0.9rem] focus:border-primary-purple outline-none transition-all duration-200" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="leave-end" className="text-[0.82rem] font-semibold text-text-secondary uppercase tracking-[0.5px]">End Date</label>
                <input id="leave-end" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="bg-bg-input border border-border-color text-text-primary px-3.5 py-2.5 rounded-sm text-[0.9rem] focus:border-primary-purple outline-none transition-all duration-200" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-4">
              <label htmlFor="leave-reason" className="text-[0.82rem] font-semibold text-text-secondary uppercase tracking-[0.5px]">Reason / Comments</label>
              <textarea
                id="leave-reason"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="bg-bg-input border border-border-color text-text-primary px-3.5 py-2.5 rounded-sm text-[0.9rem] focus:border-primary-purple outline-none resize-y min-h-[80px] transition-all duration-200"
                placeholder="Please provide a reason for your leave request..."
                rows="3"
              />
            </div>
            {formData.type === 'Sick Leave' && (
              <div className="flex flex-col gap-1.5 mt-4">
                <label htmlFor="leave-attachment" className="text-[0.82rem] font-semibold text-text-secondary uppercase tracking-[0.5px]">Medical Certificate (required for Sick Leave)</label>
                <input
                  id="leave-attachment"
                  type="file"
                  ref={attachmentRef}
                  accept="image/*,application/pdf"
                  onChange={(e) => setAttachmentFile(e.target.files[0] || null)}
                  className="bg-bg-input border border-border-color text-text-primary px-3.5 py-2.5 rounded-sm text-[0.9rem] focus:border-primary-purple outline-none transition-all duration-200 cursor-pointer"
                />
              </div>
            )}
            {formError && <p className="text-status-error text-[0.85rem] mt-2.5">{formError}</p>}
            <button
              type="submit"
              className="mt-4 px-7 py-2.5 bg-gradient-primary text-white rounded-sm font-semibold text-[0.9rem] transition-all duration-200 shadow-button hover:shadow-button-hover hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
              disabled={applyLeaveMutation.isPending}
            >
              {applyLeaveMutation.isPending ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {/* Calendar + History Layout */}
      <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
        {/* Calendar */}
        <div className="bg-bg-card border border-border-color rounded-lg p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <button className="w-8 h-8 flex items-center justify-center bg-bg-input border border-border-color rounded-sm text-text-secondary hover:border-primary-purple hover:text-primary-purple transition-all duration-200 cursor-pointer" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) } else setCalMonth(calMonth - 1) }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="text-[1rem] font-bold text-text-primary">{MONTHS[calMonth]} {calYear}</span>
            <button className="w-8 h-8 flex items-center justify-center bg-bg-input border border-border-color rounded-sm text-text-secondary hover:border-primary-purple hover:text-primary-purple transition-all duration-200 cursor-pointer" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) } else setCalMonth(calMonth + 1) }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-sans text-[0.72rem] font-semibold text-text-muted uppercase tracking-wider py-1.5">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
          <div className="flex gap-4 mt-4 pt-3.5 border-t border-border-color flex-wrap">
            <div className="flex items-center gap-1.5 text-[0.78rem] text-text-secondary"><span className="w-2.5 h-2.5 rounded-[3px] bg-status-success/50"></span>Present</div>
            <div className="flex items-center gap-1.5 text-[0.78rem] text-text-secondary"><span className="w-2.5 h-2.5 rounded-[3px] bg-status-warning/50"></span>Leave</div>
            <div className="flex items-center gap-1.5 text-[0.78rem] text-text-secondary"><span className="w-2.5 h-2.5 rounded-[3px] bg-status-error/30"></span>Absent</div>
            <div className="flex items-center gap-1.5 text-[0.78rem] text-text-secondary"><span className="w-2.5 h-2.5 rounded-[3px] bg-[rgba(107,107,128,0.3)]"></span>Weekend</div>
          </div>
        </div>

        {/* Leave History Table */}
        <div className="bg-bg-card border border-border-color rounded-lg overflow-hidden flex flex-col">
          <div className="p-6 pb-4 border-b border-border-color">
            <h3 className="text-[1rem] font-bold text-text-primary">My Leave History</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="bg-primary-purple/6 border-b border-border-color">
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className={`px-4 py-3.5 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-[0.6px] select-none ${header.column.getCanSort() ? 'cursor-pointer hover:text-text-primary' : ''}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            header.column.getIsSorted() === 'asc' ? <ArrowUp size={14} className="text-primary-purple" /> :
                            header.column.getIsSorted() === 'desc' ? <ArrowDown size={14} className="text-primary-purple" /> :
                            <ArrowUpDown size={14} className="opacity-40" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={columns.length} className="text-center py-10 text-text-muted">Loading...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={columns.length} className="text-center py-10 text-text-muted">No records found.</td></tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="border-b border-border-color/30 hover:bg-primary-purple/4 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-3.5 text-[0.88rem] text-text-primary">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {hasNextPage && (
            <div ref={ref} className="py-4 text-center text-text-muted text-[0.85rem] flex justify-center items-center gap-2">
              {isFetchingNextPage ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-purple/30 border-t-primary-purple rounded-full animate-spin"></span>
                  Loading more...
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ===== ADMIN VIEW =====
  const renderAdminView = () => (
    <div className="flex flex-col gap-6" id="timeoff-admin-view">
      <div className="flex items-center justify-between mb-7 flex-wrap gap-4">
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Leave Management</h2>
        
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative w-[260px]">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2 pl-10 pr-4 bg-bg-card border border-border-color rounded-md text-text-primary text-[0.85rem] focus:border-primary-purple outline-none"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'rejected'].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 border rounded-md text-[0.85rem] font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  adminFilter === filter
                    ? 'bg-primary-purple/10 border-primary-purple text-primary-purple font-semibold'
                    : 'bg-bg-card border-border-color text-text-secondary hover:border-primary-purple hover:text-text-primary'
                }`}
                onClick={() => setAdminFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-bg-card border border-border-color rounded-lg overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-primary-purple/6 border-b border-border-color">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className={`px-4 py-3.5 text-left text-[0.78rem] font-semibold text-text-secondary uppercase tracking-[0.6px] select-none ${header.column.getCanSort() ? 'cursor-pointer hover:text-text-primary' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          header.column.getIsSorted() === 'asc' ? <ArrowUp size={14} className="text-primary-purple" /> :
                          header.column.getIsSorted() === 'desc' ? <ArrowDown size={14} className="text-primary-purple" /> :
                          <ArrowUpDown size={14} className="opacity-40" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={columns.length} className="text-center py-10 px-4 text-text-muted italic border-b border-border-color/30">Loading…</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={columns.length} className="text-center py-10 px-4 text-text-muted italic border-b border-border-color/30">No leave requests found.</td></tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={`transition-colors duration-200 hover:bg-primary-purple/4 border-b border-border-color/30 ${row.original.status === 'pending' ? '!bg-status-warning/3' : ''}`}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3.5 text-[0.88rem] text-text-primary align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Infinite Scroll trigger */}
        {hasNextPage && (
          <div ref={ref} className="py-6 text-center text-text-muted text-[0.9rem] flex justify-center items-center gap-2 border-t border-border-color/30">
            {isFetchingNextPage ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-purple/30 border-t-primary-purple rounded-full animate-spin"></span>
                Loading more...
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {isAdmin ? renderAdminView() : renderEmployeeView()}
      </main>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => !approveRejectMutation.isPending && setModalState({ isOpen: false, type: '', id: null })}
        onConfirm={handleConfirmModal}
        title={modalState.type === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
        message={`Are you sure you want to ${modalState.type} this leave request?`}
        requireComment={true}
        confirmLabel={modalState.type === 'approve' ? 'Approve Request' : 'Reject Request'}
        cancelLabel="Cancel"
        isDestructive={modalState.type === 'reject'}
        isLoading={approveRejectMutation.isPending}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-[2000] animate-fade-in-up text-[0.95rem] font-semibold tracking-wide border bg-bg-card backdrop-blur-md ${
          toastMessage.type === 'success' 
            ? 'border-status-success/50 text-status-success shadow-[0_4px_15px_rgba(34,197,94,0.15)]' 
            : 'border-status-error/50 text-status-error shadow-[0_4px_15px_rgba(239,68,68,0.15)]'
        }`}>
          {toastMessage.type === 'success' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          {toastMessage.text}
        </div>
      )}
    </div>
  )
}

export default TimeOff

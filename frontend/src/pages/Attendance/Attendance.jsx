import { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useInView } from 'react-intersection-observer'
import { useMyAttendance, useAdminAttendanceOverview } from '../../hooks/useAttendanceApi'
import Navbar from '../../components/Navbar/Navbar'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronDown } from 'lucide-react'

const DATE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Custom Date', value: 'custom_date' },
  { label: 'Custom Date Range', value: 'custom_range' },
]

function getPresetDates(preset) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  if (preset === 'today') return { start: today, end: today }
  
  if (preset === 'yesterday') {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().split('T')[0]
    return { start: yStr, end: yStr }
  }
  
  if (preset === 'week') {
    const startOfWeek = new Date(now)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    return { 
      start: startOfWeek.toISOString().split('T')[0], 
      end: endOfWeek.toISOString().split('T')[0] 
    }
  }
  
  if (preset === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return {
      start: startOfMonth.toISOString().split('T')[0],
      end: endOfMonth.toISOString().split('T')[0]
    }
  }
  
  return { start: today, end: today }
}

const formatWorkHours = (hours) => {
  if (hours == null) return '00:00'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Custom Select Component for Date Presets
const DatePresetDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const selectedLabel = DATE_PRESETS.find(p => p.value === value)?.label || 'Select Date'

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 bg-bg-card border border-border-color text-text-primary px-4 py-2.5 rounded-md text-[0.9rem] font-medium transition-all hover:border-primary-purple focus:border-primary-purple outline-none min-w-[180px]"
      >
        {selectedLabel}
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-bg-card border border-border-color rounded-md shadow-card overflow-hidden z-20 animate-[slideDown_0.2s_ease-out]">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              className={`w-full text-left px-4 py-2.5 text-[0.9rem] transition-colors hover:bg-primary-purple/10 ${
                value === preset.value ? 'bg-primary-purple/15 text-primary-purple font-semibold' : 'text-text-primary'
              }`}
              onClick={() => {
                onChange(preset.value)
                setIsOpen(false)
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Attendance() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  // Date Filter State
  const [datePreset, setDatePreset] = useState('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  
  // Real dates sent to API
  const [apiStartDate, setApiStartDate] = useState(() => getPresetDates('month').start)
  const [apiEndDate, setApiEndDate] = useState(() => getPresetDates('month').end)
  
  useEffect(() => {
    if (datePreset !== 'custom_date' && datePreset !== 'custom_range') {
      const dates = getPresetDates(datePreset)
      setApiStartDate(dates.start)
      setApiEndDate(dates.end)
    }
  }, [datePreset])
  
  const handleApplyCustom = () => {
    if (datePreset === 'custom_date' && customStart) {
      setApiStartDate(customStart)
      setApiEndDate(customStart)
    } else if (datePreset === 'custom_range' && customStart && customEnd) {
      setApiStartDate(customStart)
      setApiEndDate(customEnd)
    }
  }

  // Search & Sorting
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

  // Queries
  const { 
    data: myAttendanceData, 
    isLoading: loadingEmployee,
    fetchNextPage: fetchNextMyAttendance,
    hasNextPage: hasNextMyAttendance,
    isFetchingNextPage: isFetchingNextMyAttendance
  } = useMyAttendance(
    { startDate: apiStartDate, endDate: apiEndDate, sortBy, sortDir },
    { enabled: !isAdmin && !!user }
  )
  
  const { 
    data: adminData, 
    isLoading: loadingAdmin,
    fetchNextPage: fetchNextAdmin,
    hasNextPage: hasNextAdmin,
    isFetchingNextPage: isFetchingNextAdmin
  } = useAdminAttendanceOverview(
    { date: apiStartDate, search: debouncedSearch, sortBy, sortDir },
    { enabled: isAdmin }
  )

  const rawDataPages = isAdmin ? (adminData?.pages || []) : (myAttendanceData?.pages || [])
  const data = useMemo(() => {
    return rawDataPages.flatMap(page => page.data || [])
  }, [rawDataPages])

  const isLoading = isAdmin ? loadingAdmin : loadingEmployee
  
  // Stats (from the first page of results)
  const firstPage = rawDataPages[0] || {}
  const monthlyStats = firstPage.summary || { days_present: 0, days_leave: 0, total_working_days: 0 }

  // Intersection Observer for Infinite Scroll
  const { ref, inView } = useInView()
  
  const hasNextPage = isAdmin ? hasNextAdmin : hasNextMyAttendance
  const isFetchingNextPage = isAdmin ? isFetchingNextAdmin : isFetchingNextMyAttendance
  const fetchNextPage = isAdmin ? fetchNextAdmin : fetchNextMyAttendance

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])


  // Columns
  const columns = useMemo(() => {
    const cols = []
    if (isAdmin) {
      cols.push({
        id: 'name',
        header: 'Employee',
        accessorFn: row => `${row.first_name} ${row.last_name}`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-text-primary text-[0.9rem]">{row.original.first_name} {row.original.last_name}</span>
            <span className="text-[0.78rem] text-text-muted">{row.original.department}</span>
          </div>
        )
      })
    } else {
      cols.push({
        id: 'date',
        header: 'Date',
        accessorKey: 'date',
        cell: ({ getValue }) => <span className="tabular-nums font-semibold">{getValue()}</span>
      })
    }
    
    cols.push(
      {
        id: 'check_in',
        header: 'Check In',
        accessorKey: 'check_in',
        cell: ({ getValue }) => (
          <span className="inline-block px-3 py-1 rounded-full text-[0.85rem] font-semibold tabular-nums bg-status-success/10 text-status-success">
            {getValue() || '--:--'}
          </span>
        )
      },
      {
        id: 'check_out',
        header: 'Check Out',
        accessorKey: 'check_out',
        cell: ({ getValue }) => (
          <span className="inline-block px-3 py-1 rounded-full text-[0.85rem] font-semibold tabular-nums bg-status-error/10 text-status-error">
            {getValue() || '--:--'}
          </span>
        )
      },
      {
        id: 'work_hours',
        header: 'Work Hours',
        accessorKey: 'work_hours',
        cell: ({ getValue }) => <span className="font-semibold tabular-nums">{formatWorkHours(getValue())}</span>
      },
      {
        id: 'extra_hours',
        header: 'Extra Hours',
        accessorKey: 'extra_hours',
        cell: ({ getValue }) => {
          const val = getValue() || 0
          return (
            <span className={`tabular-nums ${val > 0 ? 'text-status-success font-semibold' : 'text-text-muted'}`}>
              {formatWorkHours(val)}
            </span>
          )
        }
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const s = getValue() || 'absent'
          return (
            <span className={`inline-block px-2.5 py-1 rounded-full text-[12px] font-semibold capitalize ${
              s === 'present' ? 'bg-status-success/15 text-status-success' :
              s === 'leave' ? 'bg-status-info/15 text-status-info' : 'bg-status-error/15 text-status-error'
            }`}>
              {s}
            </span>
          )
        }
      }
    )
    return cols
  }, [isAdmin])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {isAdmin ? 'All Employees Attendance' : 'My Attendance'}
            </h2>
            
            <div className="flex flex-wrap items-center gap-3">
              <DatePresetDropdown value={datePreset} onChange={setDatePreset} />

              {(datePreset === 'custom_date' || datePreset === 'custom_range') && (
                <input
                  type="date"
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                  className="bg-bg-input border border-border-color px-3 py-2.5 rounded-md text-[0.9rem] text-text-primary outline-none focus:border-primary-purple focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] transition-all"
                />
              )}
              
              {datePreset === 'custom_range' && (
                <input
                  type="date"
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                  className="bg-bg-input border border-border-color px-3 py-2.5 rounded-md text-[0.9rem] text-text-primary outline-none focus:border-primary-purple focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] transition-all"
                />
              )}

              {(datePreset === 'custom_date' || datePreset === 'custom_range') && (
                <button
                  onClick={handleApplyCustom}
                  className="px-5 py-2.5 bg-gradient-primary text-white font-bold rounded-md hover:shadow-button transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  Apply
                </button>
              )}
            </div>
          </div>

          {isAdmin && (
             <div className="relative max-w-[400px] w-full">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-3 pl-11 pr-4 bg-bg-card border border-border-color rounded-md text-text-primary text-[0.9rem] focus:border-primary-purple outline-none placeholder:text-text-muted transition-all"
              />
            </div>
          )}
        </div>

        {/* Employee Stats */}
        {!isAdmin && (
          <div className="grid grid-cols-3 gap-5 mb-8 max-md:grid-cols-1">
            <div className="bg-bg-card border border-border-color rounded-2xl p-6 flex items-center gap-[18px]">
              <div className="flex flex-col">
                <span className="text-[1.8rem] font-extrabold text-text-primary leading-none">{monthlyStats.days_present}</span>
                <span className="text-[0.85rem] text-text-secondary mt-1">Days Present</span>
              </div>
            </div>
            <div className="bg-bg-card border border-border-color rounded-2xl p-6 flex items-center gap-[18px]">
              <div className="flex flex-col">
                <span className="text-[1.8rem] font-extrabold text-text-primary leading-none">{monthlyStats.days_leave}</span>
                <span className="text-[0.85rem] text-text-secondary mt-1">Leaves</span>
              </div>
            </div>
            <div className="bg-bg-card border border-border-color rounded-2xl p-6 flex items-center gap-[18px]">
              <div className="flex flex-col">
                <span className="text-[1.8rem] font-extrabold text-text-primary leading-none">{monthlyStats.total_working_days}</span>
                <span className="text-[0.85rem] text-text-secondary mt-1">Total Logs</span>
              </div>
            </div>
          </div>
        )}

        {/* TanStack Table */}
        <div className="bg-bg-card border border-border-color rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="bg-primary-purple/6 border-b border-border-color">
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className={`px-5 py-3.5 text-left text-[0.8rem] font-semibold text-text-secondary uppercase tracking-[0.6px] select-none ${header.column.getCanSort() ? 'cursor-pointer hover:text-text-primary' : ''}`}
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
                        <td key={cell.id} className="px-5 py-3.5 text-[0.9rem] text-text-primary">
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

      </main>
    </div>
  )
}

export default Attendance

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../../../features/auth'
import { useInView } from 'react-intersection-observer'
import { useMyAttendance, useAdminAttendanceOverview } from '../../api/useAttendanceApi'
import Navbar from '../../../../components/layout/Navbar/Navbar'
import DatePicker from '../../../../components/ui/DatePicker/DatePicker'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

const formatWorkHours = (hours) => {
  if (hours == null || hours === 0) return '0h 00m'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${String(m).padStart(2, '0')}m`
}

function Attendance() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  // Date Filter State
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  })

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
    { startDate: selectedDate, endDate: selectedDate, sortBy, sortDir },
    { enabled: !isAdmin && !!user }
  )
  
  const { 
    data: adminData, 
    isLoading: loadingAdmin,
    fetchNextPage: fetchNextAdmin,
    hasNextPage: hasNextAdmin,
    isFetchingNextPage: isFetchingNextAdmin
  } = useAdminAttendanceOverview(
    { date: selectedDate, search: debouncedSearch, sortBy, sortDir },
    { enabled: isAdmin }
  )

  const rawDataPages = isAdmin ? (adminData?.pages || []) : (myAttendanceData?.pages || [])
  const data = useMemo(() => {
    return rawDataPages.flatMap(page => page.data || [])
  }, [rawDataPages])

  const isLoading = isAdmin ? loadingAdmin : loadingEmployee
  


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
              <DatePicker value={selectedDate} onChange={setSelectedDate} disableFutureDates={true} />
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

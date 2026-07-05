import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../features/auth'
import { useInView } from 'react-intersection-observer'
import { useDashboardEmployees } from '../../../../features/profile'
import { useCheckIn, useCheckOut } from '../../../../features/attendance'
import Navbar from '../../../../components/layout/Navbar/Navbar'
import EmployeeCard from '../EmployeeCard/EmployeeCard'
import AddEmployeeModal from '../AddEmployeeModal/AddEmployeeModal'

function Dashboard() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [checkInError, setCheckInError] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const {
    data: employeesData,
    isLoading: loadingEmployees,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useDashboardEmployees({
    search: debouncedSearch,
  })
  
  const employees = useMemo(() => {
    return employeesData?.pages?.flatMap(page => page.data || []) || []
  }, [employeesData])

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Determine current check-in status from the logged-in user's record
  const myRecord = employees.find((e) => e.id === user?.id)
  const isCheckedIn = myRecord?.check_in && !myRecord?.check_out
  const isAdmin = user?.role === 'admin'

  const checkInMutation = useCheckIn({
    onSuccess: () => {
      setCheckInError('')
    },
    onError: (err) => {
      setCheckInError(err?.response?.data?.message || 'Check-in failed.')
    },
  })

  const checkOutMutation = useCheckOut({
    onSuccess: (res) => {
      setCheckInError('')
      if (res?.data) {
        updateUser({ today_status: 'present' })
      }
    },
    onError: (err) => {
      setCheckInError(err?.response?.data?.message || 'Check-out failed.')
    },
  })

  const handleCardClick = (id) => {
    if (user && user.id === id) {
      navigate('/my-profile')
    } else {
      navigate(`/employee/${id}`)
    }
  }

  const getTodayDateStr = () => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleToggleCheckIn = () => {
    setCheckInError('')
    if (isCheckedIn) {
      checkOutMutation.mutate()
    } else {
      checkInMutation.mutate()
    }
  }

  const isToggleLoading = checkInMutation.isPending || checkOutMutation.isPending

  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between gap-6 mb-8 max-md:flex-col max-md:items-start max-md:gap-4">
          <div>
            <h1 className="text-[1.85rem] font-extrabold text-text-primary tracking-tight mb-1">
              Welcome, {user?.first_name || user?.name}!
            </h1>
            <p className="text-[0.9rem] text-text-secondary">{getTodayDateStr()}</p>
          </div>

          {/* Check-In / Check-Out Widget */}
          <div
            className="bg-bg-card border border-border-color rounded-2xl px-5 py-4 flex items-center gap-5 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:border-primary-purple/20 max-md:w-full max-md:justify-between"
            id="checkin-checkout-widget"
          >
            <div className="flex flex-col">
              <span className="text-[0.75rem] font-bold text-text-muted uppercase tracking-[0.5px]">Attendance Status</span>
              {isCheckedIn ? (
                <span className="text-[0.88rem] font-semibold text-text-primary mt-0.5">
                  Checked In since {myRecord?.check_in || ''}
                </span>
              ) : (
                <span className="text-[0.88rem] font-semibold text-text-primary mt-0.5">Not Checked In today</span>
              )}
              {checkInError && (
                <span className="text-red-400 text-[12px] mt-1">
                  {checkInError}
                </span>
              )}
            </div>
            <button
              type="button"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[0.88rem] font-bold tracking-[0.5px] text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed ${
                isCheckedIn
                  ? 'bg-gradient-red shadow-[0_4px_15px_rgba(239,68,68,0.4)] hover:shadow-[0_6px_25px_rgba(239,68,68,0.6)]'
                  : 'bg-gradient-primary shadow-button hover:shadow-button-hover'
              }`}
              onClick={handleToggleCheckIn}
              disabled={isToggleLoading}
              id="dashboard-checkin-btn"
            >
              {isToggleLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : isCheckedIn ? (
                <>
                  Check Out
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </>
              ) : (
                <>
                  Check In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Filter / Search section */}
        <section className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          {isAdmin && (
            <button
              type="button"
              className="bg-gradient-primary text-white rounded-[10px] px-6 h-12 text-[0.9rem] font-extrabold tracking-[0.5px] shadow-button transition-all duration-300 hover:-translate-y-0.5 hover:shadow-button-hover shrink-0"
              onClick={() => setIsAddModalOpen(true)}
              id="dashboard-new-emp-btn"
            >
              NEW
            </button>
          )}
          <div className="flex items-center gap-3 bg-bg-card border border-border-color rounded-[10px] px-4 h-12 max-w-[480px] flex-1 transition-all duration-200 focus-within:border-border-focus focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.1)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted flex-shrink-0">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search employees by name, role, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-text-primary text-[0.9rem] h-full placeholder:text-text-muted"
              id="dashboard-search-input"
            />
          </div>
        </section>

        {/* Employees Grid */}
        <section className="flex flex-col gap-5">
          <h2 className="text-[1.25rem] font-bold text-text-primary">Team Directory</h2>

          {loadingEmployees ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-5 bg-bg-card border border-dashed border-border-color rounded-2xl text-text-secondary text-center">
              <p>Loading employees…</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-5 bg-bg-card border border-dashed border-border-color rounded-2xl text-text-secondary text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <p>No employees found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-auto-250 gap-6" id="employee-grid">
              {employees.map((emp) => (
                <EmployeeCard
                  key={emp.id}
                  employee={emp}
                  onClick={handleCardClick}
                />
              ))}
              {hasNextPage && (
                <div ref={ref} className="col-span-full py-8 text-center text-text-muted text-[0.9rem] flex justify-center items-center gap-2">
                  {isFetchingNextPage ? (
                    <>
                      <span className="w-4 h-4 border-2 border-primary-purple/30 border-t-primary-purple rounded-full animate-spin"></span>
                      Loading more employees...
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}

export default Dashboard

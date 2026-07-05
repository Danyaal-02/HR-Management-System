import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/**
 * Custom DatePicker matching the application's dark design system.
 * 
 * @param {string} value - Selected date string in YYYY-MM-DD format
 * @param {function} onChange - Callback triggered with new YYYY-MM-DD string
 */
function DatePicker({ value, onChange, disableFutureDates = false, minDate = null }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Parse current selected date or fallback to today
  const selectedDate = useMemo(() => {
    if (!value) return new Date()
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d)
  }, [value])

  // Current month being viewed in the calendar
  const [viewDate, setViewDate] = useState(new Date(selectedDate))

  // Sync viewDate with selectedDate when modal opens
  useEffect(() => {
    if (isOpen) {
      setViewDate(new Date(selectedDate))
    }
  }, [isOpen, selectedDate])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Generate calendar grid
  const { days, blankDays } = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    
    // Day of the week for the 1st of the month (0 = Sunday, 6 = Saturday)
    const firstDay = new Date(year, month, 1).getDay()
    
    // Number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const blanks = Array.from({ length: firstDay })
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    
    return { days: monthDays, blankDays: blanks }
  }, [viewDate])

  const handlePrevMonth = (e) => {
    e.stopPropagation()
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const handleNextMonth = (e) => {
    e.stopPropagation()
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  const handleSelectDay = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    const y = newDate.getFullYear()
    const m = String(newDate.getMonth() + 1).padStart(2, '0')
    const d = String(newDate.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
    setIsOpen(false)
  }

  const formatDisplay = (date) => {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (day) => {
    return (
      day === selectedDate.getDate() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      viewDate.getFullYear() === selectedDate.getFullYear()
    )
  }

  const isFutureDay = (day) => {
    if (!disableFutureDates) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    return checkDate > today
  }

  const isBeforeMinDate = (day) => {
    if (!minDate) return false
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    const [y, m, d] = minDate.split('-').map(Number)
    const minD = new Date(y, m - 1, d)
    return checkDate < minD
  }

  const isNextMonthDisabled = () => {
    if (!disableFutureDates) return false
    const today = new Date()
    return (
      viewDate.getFullYear() > today.getFullYear() ||
      (viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() >= today.getMonth())
    )
  }

  return (
    <div className="relative inline-block w-full max-w-[240px]" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full bg-bg-input border border-border-color text-text-primary px-4 py-2.5 rounded-md text-[0.9rem] font-medium transition-all hover:border-primary-purple focus:border-primary-purple outline-none"
      >
        <CalendarIcon size={16} className="text-primary-purple" />
        <span className="flex-1 text-left">{formatDisplay(selectedDate)}</span>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 bg-bg-card border border-border-color rounded-lg shadow-card p-4 z-[100] min-w-[280px] animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-bg-input text-text-secondary hover:text-text-primary transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[0.9rem] font-semibold text-text-primary">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              onClick={handleNextMonth}
              disabled={isNextMonthDisabled()}
              className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-bg-input text-text-secondary hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-secondary"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[0.75rem] font-bold text-text-muted">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {blankDays.map((_, i) => (
              <div key={`blank-${i}`} className="w-8 h-8" />
            ))}
            
            {days.map(day => {
              const selected = isSelected(day)
              const today = isToday(day)
              const future = isFutureDay(day)
              const beforeMin = isBeforeMinDate(day)
              const disabled = future || beforeMin
              
              let btnClass = "w-8 h-8 flex items-center justify-center rounded-md text-[0.85rem] transition-all "
              if (disabled) {
                btnClass += "text-text-muted opacity-50 cursor-not-allowed"
              } else if (selected) {
                btnClass += "bg-primary-purple text-white font-bold shadow-button"
              } else if (today) {
                btnClass += "text-primary-purple font-bold bg-primary-purple/10 hover:bg-primary-purple/20"
              } else {
                btnClass += "text-text-secondary hover:bg-bg-input hover:text-text-primary"
              }

              return (
                <button
                  key={day}
                  onClick={() => !disabled && handleSelectDay(day)}
                  disabled={disabled}
                  className={btnClass}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker

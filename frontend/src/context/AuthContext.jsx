import { createContext, useContext, useState, useEffect } from 'react'
import mockData from '../data/mockData.json'

const AuthContext = createContext(null)

/**
 * AuthProvider — stores the authenticated user and JWT token,
 * while maintaining mock state helpers for compatibility with other components.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mock states for backwards compatibility
  const [employees, setEmployees] = useState([])
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState(null)
  const [attendanceLogs, setAttendanceLogs] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [allocations, setAllocations] = useState([])

  // Rehydrate backend session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('hrms_token')
    const storedUser = localStorage.getItem('hrms_user')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('hrms_token')
        localStorage.removeItem('hrms_user')
      }
    }

    // Load mock data for fallback/mock components compatibility
    const storedEmployees = localStorage.getItem('hrms_employees')
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees))
    } else {
      setEmployees(mockData.employees)
      localStorage.setItem('hrms_employees', JSON.stringify(mockData.employees))
    }

    const storedAttendance = localStorage.getItem('hrms_attendance')
    if (storedAttendance) {
      setAttendanceLogs(JSON.parse(storedAttendance))
    } else {
      setAttendanceLogs(mockData.attendanceLogs)
      localStorage.setItem('hrms_attendance', JSON.stringify(mockData.attendanceLogs))
    }

    const storedLeaves = localStorage.getItem('hrms_leaves')
    if (storedLeaves) {
      setLeaveRequests(JSON.parse(storedLeaves))
    } else {
      setLeaveRequests(mockData.leaveRequests)
      localStorage.setItem('hrms_leaves', JSON.stringify(mockData.leaveRequests))
    }

    const storedAllocations = localStorage.getItem('hrms_allocations')
    if (storedAllocations) {
      setAllocations(JSON.parse(storedAllocations))
    } else {
      const defaultAllocations = []
      const currentEmps = storedEmployees ? JSON.parse(storedEmployees) : mockData.employees
      currentEmps.forEach(emp => {
        defaultAllocations.push({
          id: `AL-${emp.id}-PAID`,
          employeeId: emp.id,
          employeeName: emp.name,
          type: 'Paid Leave',
          days: 24,
          status: 'approved',
          appliedOn: '2025-01-01',
          notes: 'Yearly Paid Leave Allocation'
        })
        defaultAllocations.push({
          id: `AL-${emp.id}-SICK`,
          employeeId: emp.id,
          employeeName: emp.name,
          type: 'Sick Leave',
          days: 7,
          status: 'approved',
          appliedOn: '2025-01-01',
          notes: 'Yearly Sick Leave Allocation'
        })
      })
      setAllocations(defaultAllocations)
      localStorage.setItem('hrms_allocations', JSON.stringify(defaultAllocations))
    }
    
    // Set loading to false once rehydration completes
    setLoading(false)
  }, [])

  /**
   * Called after a successful login API response.
   * Stores token + user in localStorage and context state.
   */
  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('hrms_token', jwtToken)
    localStorage.setItem('hrms_user', JSON.stringify(userData))
  }

  /**
   * Clears session — removes token + user from memory and localStorage.
   */
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('hrms_token')
    localStorage.removeItem('hrms_user')
  }

  /**
   * Update stored user fields (e.g. after a profile update).
   */
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...updatedFields }
      localStorage.setItem('hrms_user', JSON.stringify(updated))
      return updated
    })
  }

  // ===== Mock Helpers kept for compatibility =====

  const register = (signupData) => {
    const companyCode = 'OI'
    const nameParts = signupData.name.trim().split(/\s+/)
    const firstName = nameParts[0] || 'EM'
    const lastName = nameParts[nameParts.length - 1] || 'PP'
    const initials = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase()
    const year = new Date().getFullYear()
    const serial = String(employees.length + 1).padStart(4, '0')
    const newId = `${companyCode}${initials}${year}${serial}`

    const newEmployee = {
      id: newId,
      name: signupData.name,
      role: 'Employee',
      company: signupData.companyName,
      department: 'General',
      manager: 'John Doe',
      email: signupData.email,
      mobile: signupData.phone,
      location: 'Gandhinagar, India',
      status: 'absent',
      profilePicture: signupData.logoPreview || '',
      about: 'No bio added yet.',
      loveAboutJob: 'Not defined yet.',
      interestsHobbies: 'Not defined yet.',
      skills: [],
      certifications: [],
      dob: '',
      address: '',
      nationality: 'Indian',
      personalEmail: signupData.email,
      gender: '',
      maritalStatus: '',
      joiningDate: new Date().toISOString().split('T')[0],
      bankDetails: {
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        panNo: '',
        uanNo: '',
        empCode: `OI-${serial}`,
      },
      salary: {
        wage: 30000,
        workingDays: 5,
        workingHours: 40,
        basic: 15000,
        hra: 7500,
        standardAllowance: 4167,
        performanceBonus: 2500,
        leaveTravelAllowance: 2500,
        fixedAllowance: -1667,
      },
    }

    const updatedEmployees = [...employees, newEmployee]
    setEmployees(updatedEmployees)
    localStorage.setItem('hrms_employees', JSON.stringify(updatedEmployees))
    return newEmployee
  }

  const toggleCheckIn = () => {
    if (!user) return
    const newStatus = !checkedIn
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

    setCheckedIn(newStatus)
    setCheckInTime(newStatus ? timeStr : null)

    localStorage.setItem(`hrms_checkin_${user.id}`, JSON.stringify({
      status: newStatus,
      time: newStatus ? timeStr : null
    }))

    const todayStr = now.toISOString().split('T')[0]
    if (newStatus) {
      const newLog = {
        employeeId: user.id,
        date: todayStr,
        checkIn: timeStr,
        checkOut: null
      }
      const updatedLogs = [...attendanceLogs, newLog]
      setAttendanceLogs(updatedLogs)
      localStorage.setItem('hrms_attendance', JSON.stringify(updatedLogs))
    } else {
      const updatedLogs = attendanceLogs.map(log => {
        if (log.employeeId === user.id && log.date === todayStr && !log.checkOut) {
          return { ...log, checkOut: timeStr }
        }
        return log
      })
      setAttendanceLogs(updatedLogs)
      localStorage.setItem('hrms_attendance', JSON.stringify(updatedLogs))
    }

    const updatedEmployees = employees.map(emp => {
      if (emp.id === user.id) {
        const updatedEmp = { ...emp, status: newStatus ? 'present' : 'absent' }
        return updatedEmp
      }
      return emp
    })
    setEmployees(updatedEmployees)
    localStorage.setItem('hrms_employees', JSON.stringify(updatedEmployees))
  }

  const addEmployee = (employeeData) => {
    const existingById = employees.find(emp => emp.id.toLowerCase() === employeeData.employeeId.toLowerCase())
    if (existingById) return { success: false, error: 'Employee ID already exists' }

    const existingByEmail = employees.find(emp => emp.email.toLowerCase() === employeeData.email.toLowerCase())
    if (existingByEmail) return { success: false, error: 'Email already exists' }

    const newEmployee = {
      id: employeeData.employeeId,
      name: employeeData.employeeId,
      role: employeeData.role,
      password: employeeData.password,
      company: user?.company || 'Odoo India',
      department: 'General',
      manager: user?.name || 'Admin',
      email: employeeData.email,
      mobile: '',
      location: 'Gandhinagar, India',
      status: 'absent',
      profilePicture: '',
      about: 'No bio added yet.',
      loveAboutJob: 'Not defined yet.',
      interestsHobbies: 'Not defined yet.',
      skills: [],
      certifications: [],
      dob: '',
      address: '',
      nationality: 'Indian',
      personalEmail: employeeData.email,
      gender: '',
      maritalStatus: '',
      joiningDate: new Date().toISOString().split('T')[0],
      bankDetails: {
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        panNo: '',
        uanNo: '',
        empCode: employeeData.employeeId,
      },
      salary: {
        wage: 30000,
        workingDays: 5,
        workingHours: 40,
        basic: 15000,
        hra: 7500,
        standardAllowance: 4167,
        performanceBonus: 2500,
        leaveTravelAllowance: 2500,
        fixedAllowance: -1667,
      },
    }

    const updatedEmployees = [...employees, newEmployee]
    setEmployees(updatedEmployees)
    localStorage.setItem('hrms_employees', JSON.stringify(updatedEmployees))
    return { success: true, employee: newEmployee }
  }

  const updateEmployee = (id, updatedFields) => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === id) {
        const updated = { ...emp, ...updatedFields }
        return updated
      }
      return emp
    })
    setEmployees(updatedEmployees)
    localStorage.setItem('hrms_employees', JSON.stringify(updatedEmployees))
  }

  const getEmployeeAttendance = (employeeId, month, year) => {
    return attendanceLogs.filter(log => {
      const logDate = new Date(log.date)
      return log.employeeId === employeeId && logDate.getMonth() === month && logDate.getFullYear() === year
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const getAttendanceByDate = (dateStr) => {
    return attendanceLogs.filter(log => log.date === dateStr)
  }

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return { total: '00:00', extra: '00:00' }
    const [inH, inM] = checkIn.split(':').map(Number)
    const [outH, outM] = checkOut.split(':').map(Number)
    let totalMinutes = (outH * 60 + outM) - (inH * 60 + inM)
    if (totalMinutes < 0) totalMinutes += 24 * 60
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    const standardMinutes = 8 * 60
    const extraMinutes = Math.max(0, totalMinutes - standardMinutes)
    const extraH = Math.floor(extraMinutes / 60)
    const extraM = extraMinutes % 60
    return {
      total: `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`,
      extra: `${String(extraH).padStart(2, '0')}:${String(extraM).padStart(2, '0')}`
    }
  }

  const getMonthlyStats = (employeeId, month, year) => {
    const logs = getEmployeeAttendance(employeeId, month, year)
    const presentDays = logs.filter(l => l.checkIn).length
    const approvedLeaves = leaveRequests.filter(lr => {
      if (lr.employeeId !== employeeId || lr.status !== 'approved') return false
      const start = new Date(lr.startDate)
      const end = new Date(lr.endDate)
      return (start.getMonth() === month && start.getFullYear() === year) || (end.getMonth() === month && end.getFullYear() === year)
    })
    let leaveDays = 0
    approvedLeaves.forEach(lr => {
      const start = new Date(lr.startDate)
      const end = new Date(lr.endDate)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getMonth() === month && d.getFullYear() === year) {
          if (d.getDay() !== 0 && d.getDay() !== 6) leaveDays++
        }
      }
    })
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    let totalWorkingDays = 0
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i).getDay()
      if (day !== 0 && day !== 6) totalWorkingDays++
    }
    return {
      presentDays,
      leaveDays,
      totalWorkingDays,
      payableDays: presentDays + leaveDays
    }
  }

  const getUnpaidLeaveDays = (employeeId, month, year) => {
    const unpaidLeaves = leaveRequests.filter(lr => lr.employeeId === employeeId && lr.status === 'approved' && lr.type === 'Unpaid Leave')
    let days = 0
    unpaidLeaves.forEach(lr => {
      const start = new Date(lr.startDate)
      const end = new Date(lr.endDate)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getMonth() === month && d.getFullYear() === year) {
          if (d.getDay() !== 0 && d.getDay() !== 6) days++
        }
      }
    })
    return days
  }

  const applyLeave = (leaveData) => {
    const newRequest = {
      id: `LR-${String(leaveRequests.length + 1).padStart(3, '0')}`,
      employeeId: user.id,
      employeeName: user.name,
      ...leaveData,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
      approvedBy: null,
      approverComment: ''
    }
    const updated = [...leaveRequests, newRequest]
    setLeaveRequests(updated)
    localStorage.setItem('hrms_leaves', JSON.stringify(updated))
    return newRequest
  }

  const updateLeaveStatus = (requestId, newStatus, comment = '') => {
    const updated = leaveRequests.map(lr => {
      if (lr.id === requestId) {
        return {
          ...lr,
          status: newStatus,
          approvedBy: user?.id || null,
          approverComment: comment
        }
      }
      return lr
    })
    setLeaveRequests(updated)
    localStorage.setItem('hrms_leaves', JSON.stringify(updated))
  }

  const getEmployeeLeaves = (employeeId) => {
    return leaveRequests.filter(lr => lr.employeeId === employeeId).sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn))
  }

  const getPendingLeaves = () => {
    return leaveRequests.filter(lr => lr.status === 'pending').sort((a, b) => new Date(a.appliedOn) - new Date(b.appliedOn))
  }

  const getAllLeaves = () => {
    return [...leaveRequests].sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn))
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      employees,
      checkedIn,
      checkInTime,
      attendanceLogs,
      leaveRequests,
      allocations,
      login,
      logout,
      register,
      toggleCheckIn,
      addEmployee,
      updateEmployee,
      getEmployeeAttendance,
      getAttendanceByDate,
      calculateWorkHours,
      getMonthlyStats,
      getUnpaidLeaveDays,
      applyLeave,
      updateLeaveStatus,
      getEmployeeLeaves,
      getPendingLeaves,
      getAllLeaves,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

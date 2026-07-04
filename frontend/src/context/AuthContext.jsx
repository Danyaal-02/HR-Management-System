import { createContext, useContext, useState, useEffect } from 'react';
import mockData from '../data/mockData.json';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  // Initialize data on mount
  useEffect(() => {
    // Try to load from localStorage first for state persistence, or fallback to mockData
    const storedEmployees = localStorage.getItem('hrms_employees');
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      setEmployees(mockData.employees);
      localStorage.setItem('hrms_employees', JSON.stringify(mockData.employees));
    }

    // Load attendance logs
    const storedAttendance = localStorage.getItem('hrms_attendance');
    if (storedAttendance) {
      setAttendanceLogs(JSON.parse(storedAttendance));
    } else {
      setAttendanceLogs(mockData.attendanceLogs);
      localStorage.setItem('hrms_attendance', JSON.stringify(mockData.attendanceLogs));
    }

    // Load leave requests
    const storedLeaves = localStorage.getItem('hrms_leaves');
    if (storedLeaves) {
      setLeaveRequests(JSON.parse(storedLeaves));
    } else {
      setLeaveRequests(mockData.leaveRequests);
      localStorage.setItem('hrms_leaves', JSON.stringify(mockData.leaveRequests));
    }

    // Load active session from localStorage
    const storedUser = localStorage.getItem('hrms_currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Load check-in status
      const storedCheckedIn = localStorage.getItem(`hrms_checkin_${parsedUser.id}`);
      if (storedCheckedIn) {
        const { status, time } = JSON.parse(storedCheckedIn);
        setCheckedIn(status);
        setCheckInTime(time);
      }
    }
  }, []);

  const login = (loginIdOrEmail, password) => {
    // Simple validation bypass/simulation
    // Find matching employee by ID or Email
    const currentEmps = JSON.parse(localStorage.getItem('hrms_employees') || '[]');
    const empsToSearch = currentEmps.length > 0 ? currentEmps : employees;
    
    const foundUser = empsToSearch.find(
      (emp) => emp.id.toLowerCase() === loginIdOrEmail.toLowerCase() || 
               emp.email.toLowerCase() === loginIdOrEmail.toLowerCase()
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('hrms_currentUser', JSON.stringify(foundUser));
      
      // Load check-in status for this user
      const storedCheckedIn = localStorage.getItem(`hrms_checkin_${foundUser.id}`);
      if (storedCheckedIn) {
        const { status, time } = JSON.parse(storedCheckedIn);
        setCheckedIn(status);
        setCheckInTime(time);
      } else {
        setCheckedIn(false);
        setCheckInTime(null);
      }
      return { success: true };
    }
    return { success: false, error: 'Invalid ID or Email' };
  };

  const logout = () => {
    setUser(null);
    setCheckedIn(false);
    setCheckInTime(null);
    localStorage.removeItem('hrms_currentUser');
  };

  const register = (signupData) => {
    // Generate new employee ID
    const companyCode = "OI";
    const nameParts = signupData.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "EM";
    const lastName = nameParts[nameParts.length - 1] || "PP";
    const initials = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase();
    
    const year = new Date().getFullYear();
    const serial = String(employees.length + 1).padStart(4, '0');
    const newId = `${companyCode}${initials}${year}${serial}`;

    const newEmployee = {
      id: newId,
      name: signupData.name,
      role: "Employee",
      company: signupData.companyName,
      department: "General",
      manager: "John Doe",
      email: signupData.email,
      mobile: signupData.phone,
      location: "Gandhinagar, India",
      status: "absent",
      profilePicture: signupData.logoPreview || "",
      about: "No bio added yet.",
      loveAboutJob: "Not defined yet.",
      interestsHobbies: "Not defined yet.",
      skills: [],
      certifications: [],
      dob: "",
      address: "",
      nationality: "Indian",
      personalEmail: signupData.email,
      gender: "",
      maritalStatus: "",
      joiningDate: new Date().toISOString().split('T')[0],
      bankDetails: {
        accountNumber: "",
        bankName: "",
        ifscCode: "",
        panNo: "",
        uanNo: "",
        empCode: `OI-${serial}`
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
        fixedAllowance: -1667
      }
    };

    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    localStorage.setItem('hrms_employees', JSON.stringify(updatedEmployees));
    
    // Log in the newly registered user automatically
    setUser(newEmployee);
    localStorage.setItem('hrms_currentUser', JSON.stringify(newEmployee));
    setCheckedIn(false);
    setCheckInTime(null);
    return newEmployee;
  };

  const toggleCheckIn = () => {
    if (!user) return;
    
    const newStatus = !checkedIn;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    setCheckedIn(newStatus);
    setCheckInTime(newStatus ? timeStr : null);
    
    // Save to localStorage
    localStorage.setItem(`hrms_checkin_${user.id}`, JSON.stringify({
      status: newStatus,
      time: newStatus ? timeStr : null
    }));

    // If checking in, add an attendance log entry for today
    const todayStr = now.toISOString().split('T')[0];
    
    if (newStatus) {
      // Checking in: add new entry
      const newLog = {
        employeeId: user.id,
        date: todayStr,
        checkIn: timeStr,
        checkOut: null
      };
      const updatedLogs = [...attendanceLogs, newLog];
      setAttendanceLogs(updatedLogs);
      localStorage.setItem('hrms_attendance', JSON.stringify(updatedLogs));
    } else {
      // Checking out: update the last entry for today
      const updatedLogs = attendanceLogs.map(log => {
        if (log.employeeId === user.id && log.date === todayStr && !log.checkOut) {
          return { ...log, checkOut: timeStr };
        }
        return log;
      });
      setAttendanceLogs(updatedLogs);
      localStorage.setItem('hrms_attendance', JSON.stringify(updatedLogs));
    }

    // Update status in employees list and current user
    const updatedEmployees = employees.map(emp => {
      if (emp.id === user.id) {
        const updatedEmp = { ...emp, status: newStatus ? 'present' : 'absent' };
        if (user.id === emp.id) {
          setUser(updatedEmp);
          localStorage.setItem('hrms_currentUser', JSON.stringify(updatedEmp));
        }
        return updatedEmp;
      }
      return emp;
    });
    
    setEmployees(updatedEmployees);
    localStorage.setItem('hrms_employees', JSON.stringify(updatedEmployees));
  };

  const updateEmployee = (id, updatedFields) => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === id) {
        const updated = { ...emp, ...updatedFields };
        if (user && user.id === id) {
          setUser(updated);
          localStorage.setItem('hrms_currentUser', JSON.stringify(updated));
        }
        return updated;
      }
      return emp;
    });
    setEmployees(updatedEmployees);
    localStorage.setItem('hrms_employees', JSON.stringify(updatedEmployees));
  };

  // ===== Attendance Helpers =====
  
  /**
   * Get attendance logs for a specific employee in a specific month/year
   */
  const getEmployeeAttendance = (employeeId, month, year) => {
    return attendanceLogs.filter(log => {
      const logDate = new Date(log.date);
      return log.employeeId === employeeId && 
             logDate.getMonth() === month && 
             logDate.getFullYear() === year;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  /**
   * Get all attendance logs for a specific date (admin view)
   */
  const getAttendanceByDate = (dateStr) => {
    return attendanceLogs.filter(log => log.date === dateStr);
  };

  /**
   * Calculate work hours between check-in and check-out times (HH:MM format)
   */
  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return { total: '00:00', extra: '00:00' };
    
    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = checkOut.split(':').map(Number);
    
    let totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight
    
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    const standardMinutes = 8 * 60; // 8 hours standard
    const extraMinutes = Math.max(0, totalMinutes - standardMinutes);
    const extraH = Math.floor(extraMinutes / 60);
    const extraM = extraMinutes % 60;
    
    return {
      total: `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`,
      extra: `${String(extraH).padStart(2, '0')}:${String(extraM).padStart(2, '0')}`
    };
  };

  /**
   * Count present days and leave days for an employee in a given month
   */
  const getMonthlyStats = (employeeId, month, year) => {
    const logs = getEmployeeAttendance(employeeId, month, year);
    const presentDays = logs.filter(l => l.checkIn).length;
    
    // Count approved leaves in this month
    const approvedLeaves = leaveRequests.filter(lr => {
      if (lr.employeeId !== employeeId || lr.status !== 'approved') return false;
      const start = new Date(lr.startDate);
      const end = new Date(lr.endDate);
      // Check if any day of the leave falls in this month
      return (start.getMonth() === month && start.getFullYear() === year) ||
             (end.getMonth() === month && end.getFullYear() === year);
    });

    let leaveDays = 0;
    approvedLeaves.forEach(lr => {
      const start = new Date(lr.startDate);
      const end = new Date(lr.endDate);
      // Count only the days that fall within this month
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getMonth() === month && d.getFullYear() === year) {
          // Only count weekdays
          if (d.getDay() !== 0 && d.getDay() !== 6) {
            leaveDays++;
          }
        }
      }
    });

    // Calculate total working days (weekdays in the month)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let totalWorkingDays = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i).getDay();
      if (day !== 0 && day !== 6) totalWorkingDays++;
    }

    return {
      presentDays,
      leaveDays,
      totalWorkingDays,
      // Payable days: present + paid leaves
      payableDays: presentDays + leaveDays
    };
  };

  /**
   * Count unpaid leave days for an employee in a given month (for salary deductions)
   */
  const getUnpaidLeaveDays = (employeeId, month, year) => {
    const unpaidLeaves = leaveRequests.filter(lr => {
      return lr.employeeId === employeeId && 
             lr.status === 'approved' && 
             lr.type === 'Unpaid Leave';
    });

    let days = 0;
    unpaidLeaves.forEach(lr => {
      const start = new Date(lr.startDate);
      const end = new Date(lr.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getMonth() === month && d.getFullYear() === year) {
          if (d.getDay() !== 0 && d.getDay() !== 6) {
            days++;
          }
        }
      }
    });
    return days;
  };

  // ===== Leave Management =====
  
  /**
   * Apply for leave (employee action)
   */
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
    };
    const updated = [...leaveRequests, newRequest];
    setLeaveRequests(updated);
    localStorage.setItem('hrms_leaves', JSON.stringify(updated));
    return newRequest;
  };

  /**
   * Approve or reject a leave request (admin action)
   */
  const updateLeaveStatus = (requestId, newStatus, comment = '') => {
    const updated = leaveRequests.map(lr => {
      if (lr.id === requestId) {
        return {
          ...lr,
          status: newStatus,
          approvedBy: user?.id || null,
          approverComment: comment
        };
      }
      return lr;
    });
    setLeaveRequests(updated);
    localStorage.setItem('hrms_leaves', JSON.stringify(updated));
  };

  /**
   * Get leave requests for a specific employee
   */
  const getEmployeeLeaves = (employeeId) => {
    return leaveRequests.filter(lr => lr.employeeId === employeeId)
      .sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
  };

  /**
   * Get all pending leave requests (admin view)
   */
  const getPendingLeaves = () => {
    return leaveRequests.filter(lr => lr.status === 'pending')
      .sort((a, b) => new Date(a.appliedOn) - new Date(b.appliedOn));
  };

  /**
   * Get all leave requests (admin view)
   */
  const getAllLeaves = () => {
    return [...leaveRequests].sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));
  };

  return (
    <AuthContext.Provider value={{
      user,
      employees,
      checkedIn,
      checkInTime,
      attendanceLogs,
      leaveRequests,
      login,
      logout,
      register,
      toggleCheckIn,
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
      getAllLeaves
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

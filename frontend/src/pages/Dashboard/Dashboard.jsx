import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar/Navbar'
import EmployeeCard from '../../components/EmployeeCard/EmployeeCard'
import './Dashboard.css'

function Dashboard() {
  const { user, employees, checkedIn, checkInTime, toggleCheckIn } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const handleCardClick = (id) => {
    // Navigate to employee view-only profile
    if (user && user.id === id) {
      navigate('/my-profile')
    } else {
      navigate(`/employee/${id}`)
    }
  }

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTodayDateStr = () => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return new Date().toLocaleDateString(undefined, options)
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-header__welcome">
            <h1 className="dashboard-header__title">Welcome, {user?.name}!</h1>
            <p className="dashboard-header__subtitle">{getTodayDateStr()}</p>
          </div>

          {/* Check-In / Check-Out Widget */}
          <div className="checkin-widget" id="checkin-checkout-widget">
            <div className="checkin-widget__info">
              <span className="checkin-widget__label">Attendance Status</span>
              {checkedIn ? (
                <span className="checkin-widget__time">
                  Checked In since {checkInTime || '09:00 AM'}
                </span>
              ) : (
                <span className="checkin-widget__time">
                  Not Checked In today
                </span>
              )}
            </div>
            <button
              type="button"
              className={`checkin-widget__btn ${checkedIn ? 'checkin-widget__btn--active' : ''}`}
              onClick={toggleCheckIn}
              id="dashboard-checkin-btn"
            >
              {checkedIn ? (
                <>
                  Check Out
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
                </>
              ) : (
                <>
                  Check In
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
                </>
              )}
            </button>
          </div>
        </header>

        {/* Filter / Search section */}
        <section className="dashboard-filters">
          <div className="dashboard-search">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search employees by name, role, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="dashboard-search-input"
            />
          </div>
        </section>

        {/* Employees Grid */}
        <section className="dashboard-grid-container">
          <h2 className="dashboard-grid-title">Team Directory</h2>

          {filteredEmployees.length === 0 ? (
            <div className="dashboard-empty-state">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <p>No employees found matching your search.</p>
            </div>
          ) : (
            <div className="dashboard-grid" id="employee-grid">
              {filteredEmployees.map((emp) => (
                <EmployeeCard
                  key={emp.id}
                  employee={emp}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Dashboard

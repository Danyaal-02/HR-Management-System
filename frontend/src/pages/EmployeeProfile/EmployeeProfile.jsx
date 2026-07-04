import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar/Navbar'
import ResumeTab from '../MyProfile/tabs/ResumeTab'
import PrivateInfoTab from '../MyProfile/tabs/PrivateInfoTab'
import SalaryInfoTab from '../MyProfile/tabs/SalaryInfoTab'
import '../MyProfile/MyProfile.css'
import './EmployeeProfile.css'

function EmployeeProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser, employees } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [activeTab, setActiveTab] = useState('resume')

  useEffect(() => {
    const foundEmp = employees.find((emp) => emp.id === id)
    if (foundEmp) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmployee(foundEmp)
    }
  }, [id, employees])

  if (!employee) {
    return (
      <div className="profile-page">
        <Navbar />
        <main className="profile-main profile-main--empty">
          <div className="profile-not-found-card">
            <h2>Employee Not Found</h2>
            <p>
              The employee with ID &quot;{id}&quot; does not exist or has been
              removed.
            </p>
            <button type="button" onClick={() => navigate('/dashboard')}>
              Go Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    )
  }

  const getInitials = (name) => {
    if (!name) return '??'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // Determine if current logged-in user is Admin
  const isCurrentUserAdmin = currentUser?.role === 'HR'

  // Tabs for view-only:
  // Salary Info tab is only visible to Admin users.
  const tabs = [
    { id: 'resume', label: 'Resume' },
    { id: 'private', label: 'Private Info' },
    ...(isCurrentUserAdmin ? [{ id: 'salary', label: 'Salary Info' }] : []),
  ]

  return (
    <div className="profile-page">
      <Navbar />

      <main className="profile-main">
        {/* Back navigation */}
        <div className="profile-back-link">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            id="btn-back-to-directory"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Directory
          </button>
        </div>

        {/* Profile Header Card */}
        <section
          className="profile-header-card profile-header-card--viewonly"
          id="employee-profile-header"
        >
          <div className="profile-header-card__avatar-section">
            <div className="profile-header-card__avatar-container profile-header-card__avatar-container--viewonly">
              {employee.profilePicture ? (
                <img
                  src={employee.profilePicture}
                  alt={employee.name}
                  className="profile-header-card__avatar"
                />
              ) : (
                <div className="profile-header-card__avatar-placeholder">
                  {getInitials(employee.name)}
                </div>
              )}
            </div>
            <div className="profile-header-card__basic-info">
              <h1 className="profile-header-card__name">{employee.name}</h1>
              <p className="profile-header-card__role">
                {employee.role} Officer
              </p>
              <span className="profile-header-card__id">
                Emp ID: {employee.id}
              </span>
            </div>
          </div>

          <div className="profile-header-card__details">
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Company</span>
              <span className="profile-detail-item__value">
                {employee.company || 'Odoo India'}
              </span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Department</span>
              <span className="profile-detail-item__value">
                {employee.department}
              </span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Manager</span>
              <span className="profile-detail-item__value">
                {employee.manager}
              </span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Work Email</span>
              <span className="profile-detail-item__value">
                {employee.email}
              </span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Mobile</span>
              <span className="profile-detail-item__value">
                {employee.mobile || 'Not set'}
              </span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Location</span>
              <span className="profile-detail-item__value">
                {employee.location}
              </span>
            </div>
          </div>
        </section>

        {/* Tabs navigation */}
        <section className="profile-tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`profile-tab-btn ${activeTab === tab.id ? 'profile-tab-btn--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              id={`emp-tab-btn-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {/* Active Tab View */}
        <section className="profile-tab-view">
          {activeTab === 'resume' && (
            <ResumeTab employee={employee} readOnly={true} />
          )}
          {activeTab === 'private' && (
            <PrivateInfoTab employee={employee} readOnly={true} />
          )}
          {activeTab === 'salary' && isCurrentUserAdmin && (
            <SalaryInfoTab employee={employee} readOnly={true} />
          )}
        </section>
      </main>
    </div>
  )
}

export default EmployeeProfile

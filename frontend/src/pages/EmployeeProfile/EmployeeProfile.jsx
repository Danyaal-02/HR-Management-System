import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProfile, useUpdateProfile, useUpdateSalary } from '../../hooks/useProfileApi'
import Navbar from '../../components/Navbar/Navbar'
import ResumeTab from '../MyProfile/tabs/ResumeTab'
import PrivateInfoTab from '../MyProfile/tabs/PrivateInfoTab'
import SalaryInfoTab from '../MyProfile/tabs/SalaryInfoTab'
import '../MyProfile/MyProfile.css'
import './EmployeeProfile.css'

function EmployeeProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('resume')

  const isCurrentUserAdmin = currentUser?.role === 'admin'

  const { data: profileData, isLoading } = useProfile(id)
  const updateProfileMutation = useUpdateProfile(id)
  const updateSalaryMutation = useUpdateSalary(id)

  const employee = profileData?.data?.user || null
  const profileInfo = profileData?.data?.profile || {}
  const skills = profileData?.data?.skills || []
  const certifications = profileData?.data?.certifications || []
  const salary = profileData?.data?.salary || null

  const handleUpdate = (updatedFields) => {
    const fd = new FormData()
    Object.entries(updatedFields).forEach(([key, value]) => {
      if (value != null) fd.append(key, value)
    })
    updateProfileMutation.mutate(fd)
  }

  const handleSalaryUpdate = (data) => {
    updateSalaryMutation.mutate(data)
  }

  const getInitials = (emp) => {
    if (!emp) return '??'
    const f = (emp.first_name || '')[0] || ''
    const l = (emp.last_name || '')[0] || ''
    return (f + l).toUpperCase() || '??'
  }

  if (isLoading) {
    return (
      <div className="profile-page">
        <Navbar />
        <main className="profile-main profile-main--empty">
          <div className="profile-not-found-card"><p>Loading profile…</p></div>
        </main>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="profile-page">
        <Navbar />
        <main className="profile-main profile-main--empty">
          <div className="profile-not-found-card">
            <h2>Employee Not Found</h2>
            <p>The employee with ID &quot;{id}&quot; does not exist or has been removed.</p>
            <button type="button" onClick={() => navigate('/dashboard')}>Go Back to Dashboard</button>
          </div>
        </main>
      </div>
    )
  }

  const displayName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim()

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
          <button type="button" onClick={() => navigate('/dashboard')} id="btn-back-to-directory">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Directory
          </button>
        </div>

        {/* Profile Header Card */}
        <section className="profile-header-card profile-header-card--viewonly" id="employee-profile-header">
          <div className="profile-header-card__avatar-section">
            <div className="profile-header-card__avatar-container profile-header-card__avatar-container--viewonly">
              {employee.profile_picture ? (
                <img src={employee.profile_picture} alt={displayName} className="profile-header-card__avatar" />
              ) : (
                <div className="profile-header-card__avatar-placeholder">{getInitials(employee)}</div>
              )}
            </div>
            <div className="profile-header-card__basic-info">
              <h1 className="profile-header-card__name">{displayName}</h1>
              <p className="profile-header-card__role">{employee.designation || employee.role}</p>
              <span className="profile-header-card__id">Emp ID: {employee.employee_id}</span>
            </div>
          </div>

          <div className="profile-header-card__details">
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Department</span>
              <span className="profile-detail-item__value">{employee.department || '—'}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Work Email</span>
              <span className="profile-detail-item__value">{employee.email}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Mobile</span>
              <span className="profile-detail-item__value">{employee.phone || 'Not set'}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Joining Date</span>
              <span className="profile-detail-item__value">
                {employee.date_of_joining ? employee.date_of_joining.split('T')[0] : '—'}
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
            <ResumeTab
              employee={{ ...employee, skills, certifications, ...profileInfo }}
              onUpdate={isCurrentUserAdmin ? handleUpdate : undefined}
              readOnly={!isCurrentUserAdmin}
            />
          )}
          {activeTab === 'private' && (
            <PrivateInfoTab
              employee={{ ...employee, ...profileInfo }}
              onUpdate={isCurrentUserAdmin ? handleUpdate : undefined}
              readOnly={!isCurrentUserAdmin}
            />
          )}
          {activeTab === 'salary' && isCurrentUserAdmin && (
            <SalaryInfoTab
              employee={{ ...employee, salary }}
              onUpdate={handleSalaryUpdate}
              readOnly={false}
            />
          )}
        </section>
      </main>
    </div>
  )
}

export default EmployeeProfile

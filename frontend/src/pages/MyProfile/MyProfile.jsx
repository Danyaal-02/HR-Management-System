import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useProfile, useUpdateProfile, useUpdateSalary } from '../../hooks/useProfileApi'
import Navbar from '../../components/Navbar/Navbar'
import ResumeTab from './tabs/ResumeTab'
import PrivateInfoTab from './tabs/PrivateInfoTab'
import SalaryInfoTab from './tabs/SalaryInfoTab'
import SecurityTab from './tabs/SecurityTab'
import './MyProfile.css'

function MyProfile() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('resume')
  const fileInputRef = useRef(null)

  const { data: profileData, isLoading } = useProfile(user?.id)
  const profileUpdateMutation = useUpdateProfile(user?.id, {
    onSuccess: () => {},
  })
  const salaryUpdateMutation = useUpdateSalary(user?.id)

  // Merged profile: API data takes precedence, falls back to context user
  const profileUser = profileData?.data?.user || user
  const profileInfo = profileData?.data?.profile || {}
  const skills = profileData?.data?.skills || []
  const certifications = profileData?.data?.certifications || []
  const salary = profileData?.data?.salary || null

  const isAdmin = profileUser?.role === 'admin'

  const handleUpdate = (updatedFields) => {
    if (!user) return
    const formData = new FormData()
    Object.entries(updatedFields).forEach(([key, value]) => {
      if (value != null) formData.append(key, value)
    })
    profileUpdateMutation.mutate(formData, {
      onSuccess: () => {
        // Update local context with non-file fields
        const safeFields = Object.fromEntries(
          Object.entries(updatedFields).filter(([, v]) => typeof v !== 'object')
        )
        if (Object.keys(safeFields).length > 0) updateUser(safeFields)
      },
    })
  }

  const handleSalaryUpdate = (data) => {
    salaryUpdateMutation.mutate(data)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const fd = new FormData()
      fd.append('profile_picture', file)
      profileUpdateMutation.mutate(fd)
    }
  }

  const getInitials = (u) => {
    if (!u) return '??'
    if (u.first_name || u.last_name) {
      return ((u.first_name?.[0] || '') + (u.last_name?.[0] || '')).toUpperCase() || '??'
    }
    const name = u.name || ''
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const displayName = profileUser
    ? profileUser.first_name
      ? `${profileUser.first_name} ${profileUser.last_name || ''}`
      : profileUser.name || ''
    : ''

  const tabs = [
    { id: 'resume', label: 'Resume' },
    { id: 'private', label: 'Private Info' },
    ...(isAdmin ? [{ id: 'salary', label: 'Salary Info' }] : []),
    { id: 'security', label: 'Security' },
  ]

  if (isLoading) {
    return (
      <div className="profile-page">
        <Navbar />
        <main className="profile-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading profile…</p>
        </main>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <Navbar />

      <main className="profile-main">
        {/* Profile Header Card */}
        <section className="profile-header-card" id="profile-header-card">
          <div className="profile-header-card__avatar-section">
            <div className="profile-header-card__avatar-container">
              {(profileUser?.profile_picture || profileUser?.profilePicture) ? (
                <img
                  src={profileUser.profile_picture || profileUser.profilePicture}
                  alt={displayName}
                  className="profile-header-card__avatar"
                />
              ) : (
                <div className="profile-header-card__avatar-placeholder">
                  {getInitials(profileUser)}
                </div>
              )}
              {/* Editable overlay button */}
              <button
                type="button"
                className="profile-header-card__avatar-edit"
                onClick={() => fileInputRef.current?.click()}
                title="Change Photo"
                id="change-profile-pic-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </div>
            <div className="profile-header-card__basic-info">
              <h1 className="profile-header-card__name">{displayName}</h1>
              <p className="profile-header-card__role">{profileUser?.role === 'admin' ? 'HR Admin' : (profileUser?.designation || 'Employee')}</p>
              <span className="profile-header-card__id">Emp ID: {profileUser?.employee_id || profileUser?.id}</span>
            </div>
          </div>

          <div className="profile-header-card__details">
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Department</span>
              <span className="profile-detail-item__value">{profileUser?.department || '—'}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Designation</span>
              <span className="profile-detail-item__value">{profileUser?.designation || '—'}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Work Email</span>
              <span className="profile-detail-item__value">{profileUser?.email}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Mobile</span>
              <span className="profile-detail-item__value">{profileUser?.phone || 'Not set'}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Joining Date</span>
              <span className="profile-detail-item__value">
                {profileUser?.date_of_joining ? profileUser.date_of_joining.split('T')[0] : '—'}
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
              id={`tab-btn-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {/* Active Tab View */}
        <section className="profile-tab-view">
          {activeTab === 'resume' && (
            <ResumeTab
              employee={{ ...profileUser, skills, certifications, ...profileInfo }}
              onUpdate={handleUpdate}
              readOnly={false}
            />
          )}
          {activeTab === 'private' && (
            <PrivateInfoTab
              employee={{ ...profileUser, ...profileInfo }}
              onUpdate={handleUpdate}
              readOnly={false}
            />
          )}
          {activeTab === 'salary' && isAdmin && (
            <SalaryInfoTab
              employee={{ ...profileUser, salary }}
              onUpdate={handleSalaryUpdate}
              readOnly={false}
            />
          )}
          {activeTab === 'security' && <SecurityTab />}
        </section>
      </main>
    </div>
  )
}

export default MyProfile

import { useState, useRef } from 'react'
import { useAuth } from '../../../../features/auth'
import { useProfile, useUpdateProfile, useUpdateSalary } from "../../api/useProfileApi"
import Navbar from "../../../../components/layout/Navbar/Navbar"
import ResumeTab from './tabs/ResumeTab'
import PrivateInfoTab from './tabs/PrivateInfoTab'
import SalaryInfoTab from './tabs/SalaryInfoTab'
import SecurityTab from './tabs/SecurityTab'

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
      <div className="min-h-screen bg-bg-dark">
        <Navbar />
        <main className="max-w-[1200px] mx-auto px-6 py-8 flex items-center justify-center min-h-[60vh]">
          <p className="text-text-muted">Loading profile…</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Profile Header Card */}
        <section className="bg-bg-card border border-border-color rounded-[20px] p-8 flex justify-between items-center gap-10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] mb-8 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-1.5 before:h-full before:bg-gradient-primary max-lg:flex-col max-lg:items-start max-lg:gap-8 max-sm:p-6" id="profile-header-card">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full border-3 border-border-color bg-bg-dark shrink-0">
              {(profileUser?.profile_picture || profileUser?.profilePicture) ? (
                <img
                  src={profileUser.profile_picture || profileUser.profilePicture}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-primary text-white flex items-center justify-center font-extrabold text-[1.85rem] tracking-wide">
                  {getInitials(profileUser)}
                </div>
              )}
              {/* Editable overlay button */}
              <button
                type="button"
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-[0_2px_8px_rgba(168,85,247,0.4)] transition-all duration-200 hover:scale-110 hover:shadow-[0_4px_12px_rgba(168,85,247,0.6)] cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                title="Change Photo"
                id="change-profile-pic-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-[1.6rem] font-extrabold text-text-primary tracking-tight leading-tight">{displayName}</h1>
              <p className="text-[0.92rem] font-semibold text-text-secondary">{profileUser?.role === 'admin' ? 'HR Admin' : (profileUser?.designation || 'Employee')}</p>
              <span className="text-[0.78rem] font-bold text-text-muted bg-white/5 px-2 py-1 rounded-sm w-fit mt-1">Emp ID: {profileUser?.employee_id || profileUser?.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-8 gap-y-4 flex-1 max-w-[680px] max-lg:w-full max-lg:max-w-none max-sm:grid-cols-2 max-sm:gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider">Department</span>
              <span className="text-[0.9rem] text-text-primary font-medium">{profileUser?.department || '—'}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider">Designation</span>
              <span className="text-[0.9rem] text-text-primary font-medium">{profileUser?.designation || '—'}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider">Work Email</span>
              <span className="text-[0.9rem] text-text-primary font-medium break-all">{profileUser?.email}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider">Mobile</span>
              <span className="text-[0.9rem] text-text-primary font-medium">{profileUser?.phone || 'Not set'}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider">Joining Date</span>
              <span className="text-[0.9rem] text-text-primary font-medium">
                {profileUser?.date_of_joining ? profileUser.date_of_joining.split('T')[0] : '—'}
              </span>
            </div>
          </div>
        </section>

        {/* Tabs navigation */}
        <section className="flex gap-3 border-b border-border-color pb-[1px] mb-6 max-sm:overflow-x-auto max-sm:whitespace-nowrap max-sm:gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`bg-transparent text-[0.95rem] font-semibold px-5 py-3 border-b-2 transition-all duration-200 hover:text-text-primary ${
                activeTab === tab.id
                  ? 'text-primary-purple border-primary-purple'
                  : 'text-text-secondary border-transparent'
              }`}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-btn-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {/* Active Tab View */}
        <section className="animate-[tabFadeIn_0.3s_ease]">
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

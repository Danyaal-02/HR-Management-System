import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useProfile, useUpdateProfile, useUpdateSalary } from '../../hooks/useProfileApi'
import Navbar from '../../components/Navbar/Navbar'
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
        <main className="max-w-[1200px] mx-auto px-6 py-8 flex items-center justify-center min-h-[400px]">
          <p className="text-text-muted italic">Loading profile…</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Profile Header Card */}
        <section className="bg-bg-card border border-border-color rounded-lg p-8 flex justify-between items-center gap-8 max-lg:flex-col max-lg:items-start" id="profile-header-card">
          <div className="flex items-center gap-6">
            <div className="relative w-[100px] h-[100px] rounded-full shrink-0">
              {(profileUser?.profile_picture || profileUser?.profilePicture) ? (
                <img
                  src={profileUser.profile_picture || profileUser.profilePicture}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-full border-3 border-primary-purple/20"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-primary text-white flex items-center justify-center text-3xl font-bold border-3 border-white/5">
                  {getInitials(profileUser)}
                </div>
              )}
              {/* Editable overlay button */}
              <button
                type="button"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-primary border-2 border-bg-card text-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 hover:opacity-90"
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
            <div className="flex flex-col gap-1">
              <h1 className="text-[1.6rem] font-extrabold text-text-primary m-0">{displayName}</h1>
              <p className="text-[0.95rem] font-semibold text-primary-purple m-0">{profileUser?.role === 'admin' ? 'HR Admin' : (profileUser?.designation || 'Employee')}</p>
              <span className="text-[0.8rem] text-text-muted font-medium">Emp ID: {profileUser?.employee_id || profileUser?.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-x-10 gap-y-5 max-w-[600px]">
            <div className="flex flex-col gap-1">
              <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-[0.5px]">Department</span>
              <span className="text-[0.88rem] font-semibold text-text-primary">{profileUser?.department || '—'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-[0.5px]">Designation</span>
              <span className="text-[0.88rem] font-semibold text-text-primary">{profileUser?.designation || '—'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-[0.5px]">Work Email</span>
              <span className="text-[0.88rem] font-semibold text-text-primary">{profileUser?.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-[0.5px]">Mobile</span>
              <span className="text-[0.88rem] font-semibold text-text-primary">{profileUser?.phone || 'Not set'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-[0.5px]">Joining Date</span>
              <span className="text-[0.88rem] font-semibold text-text-primary">
                {profileUser?.date_of_joining ? profileUser.date_of_joining.split('T')[0] : '—'}
              </span>
            </div>
          </div>
        </section>

        {/* Tabs navigation */}
        <section className="flex gap-2 border-b border-border-color pb-[1px] mt-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`relative border-b-2 px-6 py-3 text-[0.9rem] font-semibold text-text-secondary cursor-pointer transition-all duration-200 hover:text-text-primary ${activeTab === tab.id ? 'text-primary-purple! border-primary-purple!' : 'border-transparent'}`}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-btn-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {/* Active Tab View */}
        <section className="mt-4">
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

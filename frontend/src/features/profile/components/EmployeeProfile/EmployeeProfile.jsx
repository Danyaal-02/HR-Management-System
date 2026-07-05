import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../features/auth'
import { useProfile, useUpdateProfile, useUpdateSalary } from '../../api/useProfileApi'
import Navbar from '../../../../components/layout/Navbar/Navbar'
import ResumeTab from '../MyProfile/tabs/ResumeTab'
import PrivateInfoTab from '../MyProfile/tabs/PrivateInfoTab'
import SalaryInfoTab from '../MyProfile/tabs/SalaryInfoTab'

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
      <div className="min-h-screen bg-bg-dark">
        <Navbar />
        <main className="max-w-[1200px] mx-auto px-6 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="bg-bg-card border border-border-color rounded-2xl p-10 text-center max-w-[400px] shadow-card">
            <p className="text-text-secondary">Loading profile…</p>
          </div>
        </main>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-bg-dark">
        <Navbar />
        <main className="max-w-[1200px] mx-auto px-6 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="bg-bg-card border border-border-color rounded-2xl p-10 text-center max-w-[400px] shadow-card">
            <h2 className="text-status-error text-[1.4rem] mb-3 font-bold">Employee Not Found</h2>
            <p className="text-text-secondary text-[0.9rem] mb-6">The employee with ID &quot;{id}&quot; does not exist or has been removed.</p>
            <button
              type="button"
              className="bg-gradient-primary text-white px-5 py-2.5 rounded-md text-[0.88rem] font-bold shadow-button hover:-translate-y-0.5 hover:shadow-button-hover transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              Go Back to Dashboard
            </button>
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
    <div className="min-h-screen bg-bg-dark">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Back navigation */}
        <div className="mb-5">
          <button
            type="button"
            className="group flex items-center gap-2 bg-transparent text-text-secondary text-[0.88rem] font-semibold hover:text-primary-purple transition-colors duration-200 cursor-pointer"
            onClick={() => navigate('/dashboard')}
            id="btn-back-to-directory"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform duration-200 group-hover:-translate-x-1">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Directory
          </button>
        </div>

        {/* Profile Header Card */}
        <section className="bg-bg-card border border-border-color rounded-[20px] p-8 flex justify-between items-center gap-10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] mb-8 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-1.5 before:h-full before:bg-gradient-primary max-lg:flex-col max-lg:items-start max-lg:gap-8 max-sm:p-6" id="employee-profile-header">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full border-3 border-white/5 bg-bg-dark shrink-0">
              {employee.profile_picture ? (
                <img src={employee.profile_picture} alt={displayName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-primary text-white flex items-center justify-center font-extrabold text-[1.85rem] tracking-wide">{getInitials(employee)}</div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-[1.6rem] font-extrabold text-text-primary tracking-tight leading-tight">{displayName}</h1>
              <p className="text-[0.92rem] font-semibold text-text-secondary">{employee.designation || employee.role}</p>
              <span className="text-[0.78rem] font-bold text-text-muted bg-white/5 px-2 py-1 rounded-sm w-fit mt-1">Emp ID: {employee.employee_id}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-8 gap-y-4 flex-1 max-w-[680px] max-lg:w-full max-lg:max-w-none max-sm:grid-cols-2 max-sm:gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider">Department</span>
              <span className="text-[0.9rem] text-text-primary font-medium">{employee.department || '—'}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider">Work Email</span>
              <span className="text-[0.9rem] text-text-primary font-medium break-all">{employee.email}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider">Mobile</span>
              <span className="text-[0.9rem] text-text-primary font-medium">{employee.phone || 'Not set'}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.75rem] font-bold text-text-muted uppercase tracking-wider">Joining Date</span>
              <span className="text-[0.9rem] text-text-primary font-medium">
                {employee.date_of_joining ? employee.date_of_joining.split('T')[0] : '—'}
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
              id={`emp-tab-btn-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {/* Active Tab View */}
        <section className="animate-[tabFadeIn_0.3s_ease]">
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

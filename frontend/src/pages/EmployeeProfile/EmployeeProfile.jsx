import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProfile, useUpdateProfile, useUpdateSalary } from '../../hooks/useProfileApi'
import Navbar from '../../components/Navbar/Navbar'
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
        <main className="max-w-[1200px] mx-auto px-6 py-8 flex items-center justify-center min-h-[400px]">
          <div className="bg-bg-card border border-border-color rounded-lg p-8 text-center max-w-[480px] w-full"><p className="text-text-muted italic">Loading profile…</p></div>
        </main>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-bg-dark">
        <Navbar />
        <main className="max-w-[1200px] mx-auto px-6 py-8 flex items-center justify-center min-h-[400px]">
          <div className="bg-bg-card border border-border-color rounded-lg p-8 text-center max-w-[480px] w-full">
            <h2 className="text-xl font-bold text-text-primary mb-2">Employee Not Found</h2>
            <p className="text-sm text-text-secondary mb-5">The employee with ID &quot;{id}&quot; does not exist or has been removed.</p>
            <button type="button" className="px-6 py-2.5 bg-gradient-primary text-white rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 hover:opacity-90" onClick={() => navigate('/dashboard')}>Go Back to Dashboard</button>
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

      <main className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Back navigation */}
        <div className="mb-2">
          <button type="button" className="bg-transparent border-none text-text-secondary text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors duration-200 hover:text-text-primary" onClick={() => navigate('/dashboard')} id="btn-back-to-directory">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Directory
          </button>
        </div>

        {/* Profile Header Card */}
        <section className="bg-bg-card border border-border-color rounded-lg p-8 flex justify-between items-center gap-8 max-lg:flex-col max-lg:items-start" id="employee-profile-header">
          <div className="flex items-center gap-6">
            <div className="relative w-[100px] h-[100px] rounded-full shrink-0">
              {employee.profile_picture ? (
                <img src={employee.profile_picture} alt={displayName} className="w-full h-full object-cover rounded-full border-3 border-primary-purple/20" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-primary text-white flex items-center justify-center text-3xl font-bold border-3 border-white/5">{getInitials(employee)}</div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-[1.6rem] font-extrabold text-text-primary m-0">{displayName}</h1>
              <p className="text-[0.95rem] font-semibold text-primary-purple m-0">{employee.designation || employee.role}</p>
              <span className="text-[0.8rem] text-text-muted font-medium">Emp ID: {employee.employee_id}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-x-10 gap-y-5 max-w-[600px]">
            <div className="flex flex-col gap-1">
              <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-[0.5px]">Department</span>
              <span className="text-[0.88rem] font-semibold text-text-primary">{employee.department || '—'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-[0.5px]">Work Email</span>
              <span className="text-[0.88rem] font-semibold text-text-primary">{employee.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-[0.5px]">Mobile</span>
              <span className="text-[0.88rem] font-semibold text-text-primary">{employee.phone || 'Not set'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[0.72rem] font-bold text-text-muted uppercase tracking-[0.5px]">Joining Date</span>
              <span className="text-[0.88rem] font-semibold text-text-primary">
                {employee.date_of_joining ? employee.date_of_joining.split('T')[0] : '—'}
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
              id={`emp-tab-btn-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {/* Active Tab View */}
        <section className="mt-4">
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

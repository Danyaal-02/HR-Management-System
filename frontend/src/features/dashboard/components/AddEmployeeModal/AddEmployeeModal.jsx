import { useState } from 'react'
import { useCreateEmployee } from '../../../auth'
import { useQueryClient } from '@tanstack/react-query'

function AddEmployeeModal({ isOpen, onClose }) {
  const queryClient = useQueryClient()
  const createEmployeeMutation = useCreateEmployee()

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    date_of_joining: new Date().toISOString().split('T')[0],
  })

  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    setSuccessMessage('')
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.department.trim()) newErrors.department = 'Department is required'
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required'
    if (!formData.date_of_joining) newErrors.date_of_joining = 'Date of joining is required'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSuccessMessage('')
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    createEmployeeMutation.mutate(formData, {
      onSuccess: (res) => {
        if (res.success) {
          setSuccessMessage(
            `Employee created! ID: ${res.data.employee_id}. A welcome email has been sent.`
          )
          setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            department: '',
            designation: '',
            date_of_joining: new Date().toISOString().split('T')[0],
          })
          setErrors({})
          
          // Invalidate employee list query so the dashboard updates
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'employees'] })

          setTimeout(() => {
            setSuccessMessage('')
            onClose()
          }, 4000)
        }
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Failed to create employee. Please try again.'
        setErrors({ submit: msg })
      }
    })
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const isLoading = createEmployeeMutation.isPending

  return (
    <div
      className="fixed inset-0 bg-[#050508]/85 backdrop-blur-md flex items-center justify-center z-[1000] p-5 transition-all duration-200"
      onClick={handleOverlayClick}
      id="add-employee-modal-overlay"
    >
      <div className="bg-bg-card border border-border-color rounded-lg w-full max-w-[600px] p-8 relative shadow-card transition-all duration-300" id="add-employee-modal">
        {/* Close button */}
        <button
          type="button"
          className="absolute top-5 right-5 bg-transparent text-text-muted w-8 h-8 flex items-center justify-center rounded-full transition-all duration-fast hover:bg-bg-card-hover hover:text-text-primary"
          onClick={onClose}
          aria-label="Close modal"
          id="add-employee-close-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-md bg-primary-purple/10 text-primary-purple flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary tracking-tight mb-1.5">Add New Employee</h2>
          <p className="text-[0.85rem] text-text-secondary">
            Fill in the details below. An invitation email with temporary credentials will be sent.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-text-secondary tracking-wide uppercase">First Name</label>
              <div className={`relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 py-3 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus ${errors.first_name ? 'border-status-error focus-within:border-status-error' : ''}`}>
                <input
                  type="text"
                  name="first_name"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleChange}
                  autoComplete="off"
                  className="w-full bg-transparent border-none text-text-primary text-[0.95rem] placeholder-text-muted focus:outline-none"
                />
              </div>
              {errors.first_name && <span className="text-[0.78rem] text-status-error font-medium mt-1 pl-1">{errors.first_name}</span>}
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-text-secondary tracking-wide uppercase">Last Name</label>
              <div className={`relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 py-3 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus ${errors.last_name ? 'border-status-error focus-within:border-status-error' : ''}`}>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                  autoComplete="off"
                  className="w-full bg-transparent border-none text-text-primary text-[0.95rem] placeholder-text-muted focus:outline-none"
                />
              </div>
              {errors.last_name && <span className="text-[0.78rem] text-status-error font-medium mt-1 pl-1">{errors.last_name}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-text-secondary tracking-wide uppercase">Email</label>
              <div className={`relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 py-3 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus ${errors.email ? 'border-status-error focus-within:border-status-error' : ''}`}>
                <input
                  type="email"
                  name="email"
                  placeholder="john.doe@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                  className="w-full bg-transparent border-none text-text-primary text-[0.95rem] placeholder-text-muted focus:outline-none"
                />
              </div>
              {errors.email && <span className="text-[0.78rem] text-status-error font-medium mt-1 pl-1">{errors.email}</span>}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-text-secondary tracking-wide uppercase">Phone</label>
              <div className={`relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 py-3 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus ${errors.phone ? 'border-status-error focus-within:border-status-error' : ''}`}>
                <input
                  type="text"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="off"
                  className="w-full bg-transparent border-none text-text-primary text-[0.95rem] placeholder-text-muted focus:outline-none"
                />
              </div>
              {errors.phone && <span className="text-[0.78rem] text-status-error font-medium mt-1 pl-1">{errors.phone}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Department */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-text-secondary tracking-wide uppercase">Department</label>
              <div className={`relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 py-3 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus ${errors.department ? 'border-status-error focus-within:border-status-error' : ''}`}>
                <input
                  type="text"
                  name="department"
                  placeholder="Engineering"
                  value={formData.department}
                  onChange={handleChange}
                  autoComplete="off"
                  className="w-full bg-transparent border-none text-text-primary text-[0.95rem] placeholder-text-muted focus:outline-none"
                />
              </div>
              {errors.department && <span className="text-[0.78rem] text-status-error font-medium mt-1 pl-1">{errors.department}</span>}
            </div>

            {/* Designation */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.85rem] font-semibold text-text-secondary tracking-wide uppercase">Designation</label>
              <div className={`relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 py-3 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus ${errors.designation ? 'border-status-error focus-within:border-status-error' : ''}`}>
                <input
                  type="text"
                  name="designation"
                  placeholder="Software Engineer"
                  value={formData.designation}
                  onChange={handleChange}
                  autoComplete="off"
                  className="w-full bg-transparent border-none text-text-primary text-[0.95rem] placeholder-text-muted focus:outline-none"
                />
              </div>
              {errors.designation && <span className="text-[0.78rem] text-status-error font-medium mt-1 pl-1">{errors.designation}</span>}
            </div>
          </div>

          {/* Date of Joining */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-text-secondary tracking-wide uppercase">Date of Joining</label>
            <div className={`relative flex items-center bg-bg-input border border-border-color rounded-md px-3.5 py-3 transition-all duration-200 focus-within:border-primary-purple focus-within:bg-bg-input-focus ${errors.date_of_joining ? 'border-status-error focus-within:border-status-error' : ''}`}>
              <input
                type="date"
                name="date_of_joining"
                value={formData.date_of_joining}
                onChange={handleChange}
                className="w-full bg-transparent border-none text-text-primary text-[0.95rem] placeholder-text-muted focus:outline-none"
              />
            </div>
            {errors.date_of_joining && <span className="text-[0.78rem] text-status-error font-medium mt-1 pl-1">{errors.date_of_joining}</span>}
          </div>

          {/* Error / Success messages */}
          {errors.submit && (
            <div className="flex items-center gap-2.5 p-3.5 bg-status-error/10 border border-status-error/25 text-status-error rounded-md text-[0.88rem] mt-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {errors.submit}
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2.5 p-3.5 bg-status-success/10 border border-status-success/25 text-status-success rounded-md text-[0.88rem] mt-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {successMessage}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-primary hover:bg-gradient-hover text-white rounded-md text-base font-semibold transition-all duration-200 shadow-button hover:shadow-button-hover active:translate-y-0 disabled:opacity-60 flex items-center justify-center gap-2 mt-5"
            disabled={isLoading}
            id="add-employee-submit-btn"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Employee
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddEmployeeModal

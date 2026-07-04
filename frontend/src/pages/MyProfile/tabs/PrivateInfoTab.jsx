import { useState, useEffect } from 'react'

function PrivateInfoTab({ employee, onUpdate, readOnly = false }) {
  const [formData, setFormData] = useState({
    dob: employee?.dob || '',
    address: employee?.address || '',
    nationality: employee?.nationality || '',
    personalEmail: employee?.personalEmail || '',
    gender: employee?.gender || '',
    maritalStatus: employee?.maritalStatus || '',
    joiningDate: employee?.joiningDate || '',
    accountNumber: employee?.bankDetails?.accountNumber || '',
    bankName: employee?.bankDetails?.bankName || '',
    ifscCode: employee?.bankDetails?.ifscCode || '',
    panNo: employee?.bankDetails?.panNo || '',
    uanNo: employee?.bankDetails?.uanNo || '',
    empCode: employee?.bankDetails?.empCode || '',
  })

  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (employee) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        dob: employee.dob || '',
        address: employee.address || '',
        nationality: employee.nationality || '',
        personalEmail: employee.personalEmail || '',
        gender: employee.gender || '',
        maritalStatus: employee.maritalStatus || '',
        joiningDate: employee.joiningDate || '',
        accountNumber: employee.bankDetails?.accountNumber || '',
        bankName: employee.bankDetails?.bankName || '',
        ifscCode: employee.bankDetails?.ifscCode || '',
        panNo: employee.bankDetails?.panNo || '',
        uanNo: employee.bankDetails?.uanNo || '',
        empCode: employee.bankDetails?.empCode || '',
      })
    }
  }, [employee])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    onUpdate({
      dob: formData.dob,
      address: formData.address,
      nationality: formData.nationality,
      personalEmail: formData.personalEmail,
      gender: formData.gender,
      maritalStatus: formData.maritalStatus,
      joiningDate: formData.joiningDate,
      bankDetails: {
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        ifscCode: formData.ifscCode,
        panNo: formData.panNo,
        uanNo: formData.uanNo,
        empCode: formData.empCode,
      },
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      dob: employee.dob || '',
      address: employee.address || '',
      nationality: employee.nationality || '',
      personalEmail: employee.personalEmail || '',
      gender: employee.gender || '',
      maritalStatus: employee.maritalStatus || '',
      joiningDate: employee.joiningDate || '',
      accountNumber: employee.bankDetails?.accountNumber || '',
      bankName: employee.bankDetails?.bankName || '',
      ifscCode: employee.bankDetails?.ifscCode || '',
      panNo: employee.bankDetails?.panNo || '',
      uanNo: employee.bankDetails?.uanNo || '',
      empCode: employee.bankDetails?.empCode || '',
    })
    setIsEditing(false)
  }

  const renderField = (
    label,
    name,
    type = 'text',
    isSelect = false,
    options = []
  ) => {
    const isFieldReadOnly = readOnly || !isEditing

    if (isFieldReadOnly) {
      let displayValue = formData[name]
      if (name === 'dob' || name === 'joiningDate') {
        displayValue = formData[name]
          ? new Date(formData[name]).toLocaleDateString()
          : ''
      }
      return (
        <div className="flex flex-col border-b border-white/2 pb-2">
          <span className="text-[0.78rem] font-bold text-text-muted uppercase tracking-[0.5px]">{label}</span>
          <span className="text-[0.9rem] text-text-primary font-medium mt-1">
            {displayValue || '—'}
          </span>
        </div>
      )
    }

    if (isSelect) {
      return (
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.8rem] font-semibold text-text-secondary" htmlFor={`edit-field-${name}`}>{label}</label>
          <select
            id={`edit-field-${name}`}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className="bg-bg-input border border-border-color rounded-md text-text-primary px-3 h-10 text-[0.88rem] transition-colors duration-200 focus:border-border-focus focus:outline-none"
          >
            <option value="">Select...</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[0.8rem] font-semibold text-text-secondary" htmlFor={`edit-field-${name}`}>{label}</label>
        <input
          id={`edit-field-${name}`}
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="bg-bg-input border border-border-color rounded-md text-text-primary px-3 h-10 text-[0.88rem] transition-colors duration-200 focus:border-border-focus focus:outline-none"
        />
      </div>
    )
  }

  return (
    <div className="animate-tab-fade-in pt-4 flex flex-col gap-6">
      {!readOnly && (
        <div className="flex justify-end mb-5 gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                className="px-4 py-2 text-[0.85rem] font-semibold rounded-sm transition-all duration-200 bg-status-success text-white hover:opacity-90"
                onClick={handleSave}
              >
                Save Changes
              </button>
              <button
                type="button"
                className="px-4 py-2 text-[0.85rem] font-semibold rounded-sm transition-all duration-200 bg-transparent text-text-secondary border border-border-color hover:text-text-primary hover:bg-white/5 ml-2"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="px-4 py-2 text-[0.85rem] font-semibold rounded-sm transition-all duration-200 bg-primary-purple/10 text-text-link border border-primary-purple/20 hover:bg-gradient-primary hover:text-white hover:border-transparent"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile Info
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-8">
        {/* Personal Details Column */}
        <div className="bg-bg-card border border-border-color rounded-lg p-6">
          <h3 className="text-[1.1rem] text-text-primary mb-5 border-b border-white/5 pb-2 font-semibold">Personal Details</h3>
          <div className="flex flex-col gap-4">
            {renderField('Date of Birth', 'dob', 'date')}
            {renderField('Residing Address', 'address')}
            {renderField('Nationality', 'nationality')}
            {renderField('Personal Email', 'personalEmail', 'email')}
            {renderField('Gender', 'gender', 'text', true, [
              'Male',
              'Female',
              'Other',
            ])}
            {renderField('Marital Status', 'maritalStatus', 'text', true, [
              'Single',
              'Married',
              'Divorced',
              'Widowed',
            ])}
            {renderField('Date of Joining', 'joiningDate', 'date')}
          </div>
        </div>

        {/* Bank Details Column */}
        <div className="bg-bg-card border border-border-color rounded-lg p-6">
          <h3 className="text-[1.1rem] text-text-primary mb-5 border-b border-white/5 pb-2 font-semibold">
            Bank & Identification Details
          </h3>
          <div className="flex flex-col gap-4">
            {renderField('Account Number', 'accountNumber')}
            {renderField('Bank Name', 'bankName')}
            {renderField('IFSC Code', 'ifscCode')}
            {renderField('PAN Number', 'panNo')}
            {renderField('UAN Number', 'uanNo')}
            {renderField('Employee Code', 'empCode')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivateInfoTab

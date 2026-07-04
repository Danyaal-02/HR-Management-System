import { useState, useEffect } from 'react'
import './tabs.css'

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
        <div className="private-field-view">
          <span className="private-field-view__label">{label}</span>
          <span className="private-field-view__value">
            {displayValue || '—'}
          </span>
        </div>
      )
    }

    if (isSelect) {
      return (
        <div className="private-field-edit">
          <label htmlFor={`edit-field-${name}`}>{label}</label>
          <select
            id={`edit-field-${name}`}
            name={name}
            value={formData[name]}
            onChange={handleChange}
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
      <div className="private-field-edit">
        <label htmlFor={`edit-field-${name}`}>{label}</label>
        <input
          id={`edit-field-${name}`}
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
        />
      </div>
    )
  }

  return (
    <div className="profile-tab-content private-tab">
      {!readOnly && (
        <div className="private-tab__header-actions">
          {isEditing ? (
            <>
              <button
                type="button"
                className="tab-action-btn tab-action-btn--save"
                onClick={handleSave}
              >
                Save Changes
              </button>
              <button
                type="button"
                className="tab-action-btn tab-action-btn--cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="tab-action-btn tab-action-btn--edit"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile Info
            </button>
          )}
        </div>
      )}

      <div className="private-tab__columns">
        {/* Personal Details Column */}
        <div className="private-tab__column">
          <h3 className="private-tab__column-title">Personal Details</h3>
          <div className="private-tab__fields">
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
        <div className="private-tab__column">
          <h3 className="private-tab__column-title">
            Bank & Identification Details
          </h3>
          <div className="private-tab__fields">
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

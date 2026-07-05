import { useState } from 'react'

function ResumeTab({ employee, onUpdate, readOnly = false }) {
  const [newSkill, setNewSkill] = useState('')
  const [newCert, setNewCert] = useState('')
  const [isEditingAbout, setIsEditingAbout] = useState(false)
  const [aboutText, setAboutText] = useState(employee?.about || '')
  const [isEditingLove, setIsEditingLove] = useState(false)
  const [loveText, setLoveText] = useState(employee?.loveAboutJob || '')
  const [isEditingHobbies, setIsEditingHobbies] = useState(false)
  const [hobbiesText, setHobbiesText] = useState(
    employee?.interestsHobbies || ''
  )

  const handleAddSkill = (e) => {
    e.preventDefault()
    if (!newSkill.trim()) return
    const currentSkills = employee.skills || []
    if (!currentSkills.includes(newSkill.trim())) {
      onUpdate({ skills: [...currentSkills, newSkill.trim()] })
    }
    setNewSkill('')
  }

  const handleRemoveSkill = (skillToRemove) => {
    if (readOnly) return
    const currentSkills = employee.skills || []
    onUpdate({ skills: currentSkills.filter((s) => s !== skillToRemove) })
  }

  const handleAddCert = (e) => {
    e.preventDefault()
    if (!newCert.trim()) return
    const currentCerts = employee.certifications || []
    if (!currentCerts.includes(newCert.trim())) {
      onUpdate({ certifications: [...currentCerts, newCert.trim()] })
    }
    setNewCert('')
  }

  const handleRemoveCert = (certToRemove) => {
    if (readOnly) return
    const currentCerts = employee.certifications || []
    onUpdate({ certifications: currentCerts.filter((c) => c !== certToRemove) })
  }

  const handleSaveAbout = () => {
    onUpdate({ about: aboutText })
    setIsEditingAbout(false)
  }

  const handleSaveLove = () => {
    onUpdate({ loveAboutJob: loveText })
    setIsEditingLove(false)
  }

  const handleSaveHobbies = () => {
    onUpdate({ interestsHobbies: hobbiesText })
    setIsEditingHobbies(false)
  }

  return (
    <div className="animate-tab-fade-in pt-4 grid grid-cols-[2fr_1fr] max-lg:grid-cols-1 gap-8">
      <div className="flex flex-col">
        {/* About Section */}
        <div className="bg-bg-card border border-border-color rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
            <h3 className="text-[1.1rem] font-semibold text-text-primary">About</h3>
            {!readOnly && !isEditingAbout && (
              <button
                type="button"
                className="bg-transparent text-text-link hover:text-text-link-hover text-[0.82rem] font-semibold"
                onClick={() => setIsEditingAbout(true)}
                id="edit-about-btn"
              >
                Edit
              </button>
            )}
          </div>
          {isEditingAbout ? (
            <div className="flex flex-col">
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="w-full bg-bg-input border border-border-color rounded-md text-text-primary p-3 text-[0.9rem] resize-y focus:border-border-focus focus:outline-none"
                rows="4"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-primary-purple text-white rounded-sm text-[0.82rem] font-semibold hover:opacity-90 transition-all duration-200"
                  onClick={handleSaveAbout}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-transparent text-text-secondary border border-border-color rounded-sm text-[0.82rem] font-semibold hover:text-text-primary hover:bg-white/5 transition-all duration-200"
                  onClick={() => {
                    setAboutText(employee.about || '')
                    setIsEditingAbout(false)
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[0.9rem] text-text-secondary whitespace-pre-line">
              {employee?.about || 'No description provided.'}
            </p>
          )}
        </div>

        {/* What I love about my job Section */}
        <div className="bg-bg-card border border-border-color rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
            <h3 className="text-[1.1rem] font-semibold text-text-primary">What I love about my job</h3>
            {!readOnly && !isEditingLove && (
              <button
                type="button"
                className="bg-transparent text-text-link hover:text-text-link-hover text-[0.82rem] font-semibold"
                onClick={() => setIsEditingLove(true)}
                id="edit-love-btn"
              >
                Edit
              </button>
            )}
          </div>
          {isEditingLove ? (
            <div className="flex flex-col">
              <textarea
                value={loveText}
                onChange={(e) => setLoveText(e.target.value)}
                className="w-full bg-bg-input border border-border-color rounded-md text-text-primary p-3 text-[0.9rem] resize-y focus:border-border-focus focus:outline-none"
                rows="4"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-primary-purple text-white rounded-sm text-[0.82rem] font-semibold hover:opacity-90 transition-all duration-200"
                  onClick={handleSaveLove}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-transparent text-text-secondary border border-border-color rounded-sm text-[0.82rem] font-semibold hover:text-text-primary hover:bg-white/5 transition-all duration-200"
                  onClick={() => {
                    setLoveText(employee.loveAboutJob || '')
                    setIsEditingLove(false)
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[0.9rem] text-text-secondary whitespace-pre-line">
              {employee?.loveAboutJob || 'No description provided.'}
            </p>
          )}
        </div>

        {/* Interests & Hobbies */}
        <div className="bg-bg-card border border-border-color rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
            <h3 className="text-[1.1rem] font-semibold text-text-primary">My interests and hobbies</h3>
            {!readOnly && !isEditingHobbies && (
              <button
                type="button"
                className="bg-transparent text-text-link hover:text-text-link-hover text-[0.82rem] font-semibold"
                onClick={() => setIsEditingHobbies(true)}
                id="edit-hobbies-btn"
              >
                Edit
              </button>
            )}
          </div>
          {isEditingHobbies ? (
            <div className="flex flex-col">
              <textarea
                value={hobbiesText}
                onChange={(e) => setHobbiesText(e.target.value)}
                className="w-full bg-bg-input border border-border-color rounded-md text-text-primary p-3 text-[0.9rem] resize-y focus:border-border-focus focus:outline-none"
                rows="4"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-primary-purple text-white rounded-sm text-[0.82rem] font-semibold hover:opacity-90 transition-all duration-200"
                  onClick={handleSaveHobbies}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-transparent text-text-secondary border border-border-color rounded-sm text-[0.82rem] font-semibold hover:text-text-primary hover:bg-white/5 transition-all duration-200"
                  onClick={() => {
                    setHobbiesText(employee.interestsHobbies || '')
                    setIsEditingHobbies(false)
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[0.9rem] text-text-secondary whitespace-pre-line">
              {employee?.interestsHobbies || 'No description provided.'}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        {/* Skills Section */}
        <div className="bg-bg-card border border-border-color rounded-lg p-6 mb-6">
          <h3 className="text-base font-semibold text-text-primary mb-4 border-b border-white/5 pb-2">Skills</h3>

          <div className="flex flex-wrap gap-2 mb-5">
            {employee?.skills?.length === 0 ? (
              <p className="text-[0.85rem] text-text-muted italic">No skills listed yet.</p>
            ) : (
              employee?.skills?.map((skill, index) => (
                <span key={index} className="bg-primary-purple/8 border border-primary-purple/15 text-text-link-hover px-3 py-1.5 rounded-sm text-[0.8rem] font-semibold flex items-center gap-1.5">
                  {skill}
                  {!readOnly && (
                    <button
                      type="button"
                      className="bg-transparent text-text-muted hover:text-status-error text-base font-bold leading-none"
                      onClick={() => handleRemoveSkill(skill)}
                      aria-label={`Remove skill ${skill}`}
                    >
                      &times;
                    </button>
                  )}
                </span>
              ))
            )}
          </div>

          {!readOnly && (
            <form
              onSubmit={handleAddSkill}
              className="flex gap-2"
              id="add-skill-form"
            >
              <input
                type="text"
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                id="add-skill-input"
                className="flex-1 bg-bg-input border border-border-color rounded-md text-text-primary px-3 text-[0.85rem] h-[38px] focus:border-border-focus focus:outline-none"
              />
              <button type="submit" id="add-skill-btn" className="bg-white/5 border border-border-color text-text-primary rounded-md px-3.5 text-[0.8rem] font-semibold whitespace-nowrap transition-all duration-200 hover:bg-gradient-primary hover:border-transparent hover:text-white">
                + Add Skill
              </button>
            </form>
          )}
        </div>

        {/* Certifications Section */}
        <div className="bg-bg-card border border-border-color rounded-lg p-6 mb-6">
          <h3 className="text-base font-semibold text-text-primary mb-4 border-b border-white/5 pb-2">Certifications</h3>

          <ul className="flex flex-col gap-3 mb-5">
            {employee?.certifications?.length === 0 ? (
              <p className="text-[0.85rem] text-text-muted italic">
                No certifications listed yet.
              </p>
            ) : (
              employee?.certifications?.map((cert, index) => (
                <li key={index} className="flex items-center justify-between p-2.5 bg-white/2 border border-border-color rounded-md">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🏆</span>
                    <span className="text-[0.85rem] text-text-secondary font-medium">{cert}</span>
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      className="bg-transparent text-text-muted hover:text-status-error text-lg"
                      onClick={() => handleRemoveCert(cert)}
                      aria-label={`Remove certification ${cert}`}
                    >
                      &times;
                    </button>
                  )}
                </li>
              ))
            )}
          </ul>

          {!readOnly && (
            <form
              onSubmit={handleAddCert}
              className="flex gap-2"
              id="add-cert-form"
            >
              <input
                type="text"
                placeholder="Add a certification..."
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                id="add-cert-input"
                className="flex-1 bg-bg-input border border-border-color rounded-md text-text-primary px-3 text-[0.85rem] h-[38px] focus:border-border-focus focus:outline-none"
              />
              <button type="submit" id="add-cert-btn" className="bg-white/5 border border-border-color text-text-primary rounded-md px-3.5 text-[0.8rem] font-semibold whitespace-nowrap transition-all duration-200 hover:bg-gradient-primary hover:border-transparent hover:text-white">
                + Add Cert
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeTab

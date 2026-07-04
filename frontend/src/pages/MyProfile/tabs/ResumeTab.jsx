import { useState } from 'react';
import './tabs.css';

function ResumeTab({ employee, onUpdate, readOnly = false }) {
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState(employee?.about || '');
  const [isEditingLove, setIsEditingLove] = useState(false);
  const [loveText, setLoveText] = useState(employee?.loveAboutJob || '');
  const [isEditingHobbies, setIsEditingHobbies] = useState(false);
  const [hobbiesText, setHobbiesText] = useState(employee?.interestsHobbies || '');

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const currentSkills = employee.skills || [];
    if (!currentSkills.includes(newSkill.trim())) {
      onUpdate({ skills: [...currentSkills, newSkill.trim()] });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    if (readOnly) return;
    const currentSkills = employee.skills || [];
    onUpdate({ skills: currentSkills.filter(s => s !== skillToRemove) });
  };

  const handleAddCert = (e) => {
    e.preventDefault();
    if (!newCert.trim()) return;
    const currentCerts = employee.certifications || [];
    if (!currentCerts.includes(newCert.trim())) {
      onUpdate({ certifications: [...currentCerts, newCert.trim()] });
    }
    setNewCert('');
  };

  const handleRemoveCert = (certToRemove) => {
    if (readOnly) return;
    const currentCerts = employee.certifications || [];
    onUpdate({ certifications: currentCerts.filter(c => c !== certToRemove) });
  };

  const handleSaveAbout = () => {
    onUpdate({ about: aboutText });
    setIsEditingAbout(false);
  };

  const handleSaveLove = () => {
    onUpdate({ loveAboutJob: loveText });
    setIsEditingLove(false);
  };

  const handleSaveHobbies = () => {
    onUpdate({ interestsHobbies: hobbiesText });
    setIsEditingHobbies(false);
  };

  return (
    <div className="profile-tab-content resume-tab">
      <div className="resume-tab__left">
        {/* About Section */}
        <div className="resume-section">
          <div className="resume-section__header">
            <h3>About</h3>
            {!readOnly && !isEditingAbout && (
              <button 
                type="button" 
                className="resume-section__edit-btn"
                onClick={() => setIsEditingAbout(true)}
                id="edit-about-btn"
              >
                Edit
              </button>
            )}
          </div>
          {isEditingAbout ? (
            <div className="resume-section__edit-mode">
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="resume-section__textarea"
                rows="4"
              />
              <div className="resume-section__actions">
                <button type="button" className="resume-section__save" onClick={handleSaveAbout}>Save</button>
                <button type="button" className="resume-section__cancel" onClick={() => { setAboutText(employee.about || ''); setIsEditingAbout(false); }}>Cancel</button>
              </div>
            </div>
          ) : (
            <p className="resume-section__text">{employee?.about || 'No description provided.'}</p>
          )}
        </div>

        {/* What I love about my job Section */}
        <div className="resume-section">
          <div className="resume-section__header">
            <h3>What I love about my job</h3>
            {!readOnly && !isEditingLove && (
              <button 
                type="button" 
                className="resume-section__edit-btn"
                onClick={() => setIsEditingLove(true)}
                id="edit-love-btn"
              >
                Edit
              </button>
            )}
          </div>
          {isEditingLove ? (
            <div className="resume-section__edit-mode">
              <textarea
                value={loveText}
                onChange={(e) => setLoveText(e.target.value)}
                className="resume-section__textarea"
                rows="4"
              />
              <div className="resume-section__actions">
                <button type="button" className="resume-section__save" onClick={handleSaveLove}>Save</button>
                <button type="button" className="resume-section__cancel" onClick={() => { setLoveText(employee.loveAboutJob || ''); setIsEditingLove(false); }}>Cancel</button>
              </div>
            </div>
          ) : (
            <p className="resume-section__text">{employee?.loveAboutJob || 'No description provided.'}</p>
          )}
        </div>

        {/* Interests & Hobbies */}
        <div className="resume-section">
          <div className="resume-section__header">
            <h3>My interests and hobbies</h3>
            {!readOnly && !isEditingHobbies && (
              <button 
                type="button" 
                className="resume-section__edit-btn"
                onClick={() => setIsEditingHobbies(true)}
                id="edit-hobbies-btn"
              >
                Edit
              </button>
            )}
          </div>
          {isEditingHobbies ? (
            <div className="resume-section__edit-mode">
              <textarea
                value={hobbiesText}
                onChange={(e) => setHobbiesText(e.target.value)}
                className="resume-section__textarea"
                rows="4"
              />
              <div className="resume-section__actions">
                <button type="button" className="resume-section__save" onClick={handleSaveHobbies}>Save</button>
                <button type="button" className="resume-section__cancel" onClick={() => { setHobbiesText(employee.interestsHobbies || ''); setIsEditingHobbies(false); }}>Cancel</button>
              </div>
            </div>
          ) : (
            <p className="resume-section__text">{employee?.interestsHobbies || 'No description provided.'}</p>
          )}
        </div>
      </div>

      <div className="resume-tab__right">
        {/* Skills Section */}
        <div className="resume-section">
          <h3 className="resume-section__side-title">Skills</h3>
          
          <div className="skills-list">
            {employee?.skills?.length === 0 ? (
              <p className="resume-section__empty">No skills listed yet.</p>
            ) : (
              employee?.skills?.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                  {!readOnly && (
                    <button
                      type="button"
                      className="skill-tag__remove"
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
            <form onSubmit={handleAddSkill} className="resume-section__add-form" id="add-skill-form">
              <input
                type="text"
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                id="add-skill-input"
              />
              <button type="submit" id="add-skill-btn">+ Add Skill</button>
            </form>
          )}
        </div>

        {/* Certifications Section */}
        <div className="resume-section">
          <h3 className="resume-section__side-title">Certifications</h3>
          
          <ul className="certifications-list">
            {employee?.certifications?.length === 0 ? (
              <p className="resume-section__empty">No certifications listed yet.</p>
            ) : (
              employee?.certifications?.map((cert, index) => (
                <li key={index} className="certification-item">
                  <div className="certification-item__content">
                    <span className="certification-item__bullet">🏆</span>
                    <span className="certification-item__name">{cert}</span>
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      className="certification-item__remove"
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
            <form onSubmit={handleAddCert} className="resume-section__add-form" id="add-cert-form">
              <input
                type="text"
                placeholder="Add a certification..."
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                id="add-cert-input"
              />
              <button type="submit" id="add-cert-btn">+ Add Cert</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumeTab;

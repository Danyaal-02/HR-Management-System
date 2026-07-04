import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import ResumeTab from './tabs/ResumeTab';
import PrivateInfoTab from './tabs/PrivateInfoTab';
import SalaryInfoTab from './tabs/SalaryInfoTab';
import SecurityTab from './tabs/SecurityTab';
import './MyProfile.css';

function MyProfile() {
  const { user, updateEmployee } = useAuth();
  const [activeTab, setActiveTab] = useState('resume');
  const fileInputRef = useRef(null);

  const handleUpdate = (updatedFields) => {
    if (user) {
      updateEmployee(user.id, updatedFields);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleUpdate({ profilePicture: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Determine if logged in user is Admin (HR) or normal employee
  const isAdmin = user?.role === 'HR';

  // Available tabs: Normal employee doesn't see Salary Info (unless Admin)
  const tabs = [
    { id: 'resume', label: 'Resume' },
    { id: 'private', label: 'Private Info' },
    ...(isAdmin ? [{ id: 'salary', label: 'Salary Info' }] : []),
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="profile-page">
      <Navbar />

      <main className="profile-main">
        {/* Profile Header Card */}
        <section className="profile-header-card" id="profile-header-card">
          <div className="profile-header-card__avatar-section">
            <div className="profile-header-card__avatar-container">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="profile-header-card__avatar" />
              ) : (
                <div className="profile-header-card__avatar-placeholder">
                  {getInitials(user?.name)}
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
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="profile-header-card__basic-info">
              <h1 className="profile-header-card__name">{user?.name}</h1>
              <p className="profile-header-card__role">{user?.role} Officer</p>
              <span className="profile-header-card__id">Emp ID: {user?.id}</span>
            </div>
          </div>

          <div className="profile-header-card__details">
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Company</span>
              <span className="profile-detail-item__value">{user?.company || 'Odoo India'}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Department</span>
              <span className="profile-detail-item__value">{user?.department}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Manager</span>
              <span className="profile-detail-item__value">{user?.manager}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Work Email</span>
              <span className="profile-detail-item__value">{user?.email}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Mobile</span>
              <span className="profile-detail-item__value">{user?.mobile || 'Not set'}</span>
            </div>
            <div className="profile-detail-item">
              <span className="profile-detail-item__label">Location</span>
              <span className="profile-detail-item__value">{user?.location}</span>
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
              employee={user}
              onUpdate={handleUpdate}
              readOnly={false}
            />
          )}
          {activeTab === 'private' && (
            <PrivateInfoTab
              employee={user}
              onUpdate={handleUpdate}
              readOnly={false}
            />
          )}
          {activeTab === 'salary' && isAdmin && (
            <SalaryInfoTab
              employee={user}
              onUpdate={handleUpdate}
              readOnly={false}
            />
          )}
          {activeTab === 'security' && <SecurityTab />}
        </section>
      </main>
    </div>
  );
}

export default MyProfile;

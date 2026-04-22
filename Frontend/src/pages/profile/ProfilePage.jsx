import { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useUserStore from '../../store/useUserStore';
import api from '../../lib/api';
import { User, Camera, Save, Mail, GraduationCap } from 'lucide-react';
import GlassDropdown from '../../components/ui/GlassDropdown';
import ProfileSkeleton from '../../components/skeletons/ProfileSkeleton';

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const { profile, fetchProfile, isLoading, uploadAvatar, updateProfile } = useUserStore();
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    board: 'NONE',
    class: '10',
  });
  const [studentUsername, setStudentUsername] = useState('');

  const boardOptions = [
    { value: 'CBSE', label: 'CBSE' },
    { value: 'ICSE', label: 'ICSE' },
    { value: 'WB', label: 'WB Board' },
    { value: 'NONE', label: 'None' }
  ];

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        board: profile.boardInfo?.board || 'NONE',
        class: profile.boardInfo?.class || '10',
      });
    }
  }, [profile]);

  if (isLoading && !profile) {
    return <ProfileSkeleton />;
  }

  // Fallback to use either profile or auth user for immediate display
  const currentUser = profile || user;

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSuccess('');
      const data = await updateProfile({
        name: formData.name,
        boardInfo: {
          board: formData.board,
          class: formData.class
        }
      });
      setUser(data.data); // Keep auth store synced
      setSuccess('Profile updated successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return alert('Transmission error: Image exceeds tactical 10MB limit.');
    }

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await uploadAvatar(uploadData);
      setUser(res.data); // Keep auth store synced
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="profile-page">
      <header>
        <h1 className="glow-text">Profile Settings</h1>
        <p>Manage your account and preferences.</p>
      </header>

      <div className="profile-card">
        <div className="avatar-section">
          <div className="avatar-wrapper">
            <div className="avatar-circle">
              {currentUser?.profilePic ? (
                <img src={currentUser.profilePic} alt="Profile" />
              ) : (
                <User size={40} opacity={0.3} />
              )}
            </div>
            <label className="upload-label">
              <Camera size={16} color="white" />
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
          <div className="user-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2>{currentUser?.name}</h2>
              <span style={{ 
                background: 'rgba(59, 130, 246, 0.15)', 
                color: '#60a5fa', 
                padding: '2px 10px', 
                borderRadius: '12px', 
                fontSize: '0.75rem',
                fontFamily: 'Orbitron, sans-serif',
                letterSpacing: '1px'
              }}>
                @{currentUser?.username}
              </span>
            </div>
            <p className="email-text">
              <Mail size={14} /> {currentUser?.email}
            </p>
            <p style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '0.25rem' }}>Image should be under 10MB</p>
          </div>
        </div>

        {success && <div className="alert-success" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e', padding: '0.75rem', borderRadius: '8px', fontFamily: 'Inter' }}>{success}</div>}

        <form onSubmit={handleUpdate} className="settings-form">
          <div className="input-group">
            <label>Full Name</label>
            <input 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="glass-input"
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <GlassDropdown 
                label="Board"
                options={boardOptions}
                value={formData.board}
                onChange={(val) => setFormData({...formData, board: val})}
                icon={GraduationCap}
              />
            </div>
            <div className="input-group" style={{ justifyContent: 'flex-end' }}>
              <label>Class / Year</label>
              <input 
                 value={formData.class}
                 onChange={(e) => setFormData({...formData, class: e.target.value})}
                 className="glass-input"
                 placeholder="e.g. 10"
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary flex-center" style={{ marginTop: '1rem', gap: '0.5rem' }}>
            {isLoading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
          </button>
        </form>
      </div>

      <div className="profile-card" style={{ marginTop: '2rem' }}>
        <header style={{ marginBottom: '1.5rem' }}>
          <h3 className="glow-text">{currentUser?.role === 'TEACHER' ? 'My Student Cohort' : 'My Academic Mentors'}</h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
            {currentUser?.role === 'TEACHER' 
              ? 'Add and manage students recruited to your network.' 
              : 'Teachers who have added you to their tasks.'}
          </p>
        </header>

        {currentUser?.role === 'TEACHER' && (
          <div className="add-student-form" style={{ marginBottom: '2rem' }}>
            <div className="input-group">
              <label>Recruit Student by Username</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  placeholder="e.g. ramiz123" 
                  value={studentUsername}
                  onChange={(e) => setStudentUsername(e.target.value)}
                  className="glass-input" 
                />
                <button 
                  onClick={async () => {
                    if (!studentUsername) return;
                    try {
                      await api.post('/user/add-student', { username: studentUsername });
                      setSuccess('Student recruited successfully!');
                      setStudentUsername('');
                      fetchProfile(); // Refresh profile via store
                    } catch (err) {
                      alert(err.response?.data?.message || err.message);
                    }
                  }}
                  disabled={isLoading}
                  className="btn-primary" 
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {isLoading ? '...' : 'Recruit'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="network-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {currentUser?.role === 'TEACHER' ? (
            currentUser?.students?.length > 0 ? currentUser.students.map(s => (
              <div key={s._id} className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                <p style={{ fontWeight: 600 }}>{s.name}</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>@{s.username}</p>
              </div>
            )) : <p style={{ opacity: 0.5 }}>No students in cohort yet.</p>
          ) : (
            currentUser?.teachers?.length > 0 ? currentUser.teachers.map(t => (
              <div key={t._id} className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                <p style={{ fontWeight: 600 }}>{t.name}</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>@{t.username}</p>
              </div>
            )) : <p style={{ opacity: 0.5 }}>No linked mentors yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

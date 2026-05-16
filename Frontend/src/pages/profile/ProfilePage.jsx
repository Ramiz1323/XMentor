import { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useUserStore from '../../store/useUserStore';
import api from '../../lib/api';
import { User, Camera, Save, Mail, GraduationCap } from 'lucide-react';
import GlassDropdown from '../../components/ui/GlassDropdown';
import ProfileSkeleton from '../../components/skeletons/ProfileSkeleton';
import LoadingOverlay from '../../components/ui/LoadingOverlay';

const TacticalThemes = [
  { id: 'blue',      label: 'Blue',          color: '#3b82f6', glow: 'rgba(59,130,246,0.5)',  premium: false },
  { id: 'red',       label: 'Red',           color: '#ef4444', glow: 'rgba(239,68,68,0.5)',   premium: false },
  { id: 'emerald',   label: 'Emerald',       color: '#10b981', glow: 'rgba(16,185,129,0.5)',  premium: false },
  { id: 'purple',    label: 'Purple',        color: '#8b5cf6', glow: 'rgba(139,92,246,0.5)',  premium: false },
  { id: 'bts',       label: 'Borahae',       color: '#9b6dff', glow: 'rgba(155,109,255,0.5)', premium: false },
  { id: 'amber',     label: 'Amber',         color: '#f59e0b', glow: 'rgba(245,158,11,0.5)',  premium: false },
  { id: 'cyberpunk', label: 'Cyberpunk',     color: '#00ff88', glow: 'rgba(0,255,136,0.5)',   premium: true, itemId: 'theme_cyberpunk' },
  { id: 'gold',      label: 'Gold Commander',color: '#ffd700', glow: 'rgba(255,215,0,0.5)',   premium: true, itemId: 'theme_gold' },
  { id: 'neon-pink', label: 'Neon Sigma',    color: '#ff00cc', glow: 'rgba(255,0,204,0.5)',   premium: true, itemId: 'theme_neon_pink' },
];

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const { profile, fetchProfile, isLoading, uploadAvatar, updateProfile } = useUserStore();
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ name: '', board: 'NONE', class: '10' });
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);
  const [studentUsername, setStudentUsername] = useState('');

  const boardOptions = [
    { value: 'CBSE', label: 'CBSE' },
    { value: 'ICSE', label: 'ICSE' },
    { value: 'WB', label: 'WB Board' },
    { value: 'NONE', label: 'None' },
  ];

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        board: profile.boardInfo?.board || 'NONE',
        class: profile.boardInfo?.class || '10',
      });
    }
  }, [profile]);

  if (isLoading && !profile) return <ProfileSkeleton />;

  const currentUser = profile || user;

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSuccess('');
      const data = await updateProfile({ boardInfo: { board: formData.board, class: formData.class } });
      setUser(data.data);
      setSuccess('Profile updated successfully!');
    } catch (err) { alert(err.message); }
  };

  const handleUpdateTheme = async (themeId) => {
    try {
      setSuccess('');
      setIsUpdatingTheme(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = await updateProfile({ theme: themeId });
      setUser(data.data);
      setSuccess('Tactical interface recalibrated successfully.');
    } catch (err) { alert(err.message); }
    finally { setIsUpdatingTheme(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return alert('Transmission error: Image exceeds tactical 10MB limit.');
    const uploadData = new FormData();
    uploadData.append('image', file);
    try {
      const res = await uploadAvatar(uploadData);
      setUser(res.data);
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="profile-page">
      {isUpdatingTheme && <LoadingOverlay message="Recalibrating Tactical Interface..." />}

      <header>
        <h1 className="glow-text">Profile Settings</h1>
        <p>Manage your account and preferences.</p>
      </header>

      {/* ── Identity Card ── */}
      <div className="profile-card">
        <div className="avatar-section">
          <div className="avatar-wrapper">
            <div className="avatar-circle">
              {currentUser?.profilePic
                ? <img src={currentUser.profilePic} alt="Profile" />
                : <User size={40} opacity={0.3} />}
            </div>
            <label className="upload-label">
              <Camera size={16} color="white" />
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
          <div className="user-meta">
            <div className="user-meta__header">
              <h2>{currentUser?.name}</h2>
              <span className="username-badge">@{currentUser?.username}</span>
            </div>
            <p className="email-text"><Mail size={14} /> {currentUser?.email}</p>
            <p className="upload-hint">Image should be under 10MB</p>
          </div>
        </div>

        {success && <div className="alert-success-profile">{success}</div>}

        <form onSubmit={handleUpdate} className="settings-form">
          <div className="input-group">
            <div className="label-row">
              <label>Full Name</label>
              <span className="unchanged-label">Unchangeable</span>
            </div>
            <input value={formData.name} disabled className="glass-input disabled" />
          </div>

          <div className="form-row">
            <div className="input-group">
              <GlassDropdown
                label="Board"
                options={boardOptions}
                value={formData.board}
                onChange={(val) => setFormData({ ...formData, board: val })}
                icon={GraduationCap}
              />
            </div>
            <div className="input-group input-group--end">
              <label>Class / Year</label>
              <input
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="glass-input"
                placeholder="e.g. 10"
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary flex-center profile-save-btn">
            {isLoading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* ── Theme Selector ── */}
      <div className="profile-card profile-card--spaced">
        <header className="profile-section-header">
          <h3 className="glow-text">Tactical Visual Interface</h3>
          <p>Calibrate the environment&apos;s color signature for optimal tactical focus.</p>
        </header>

        <div className="theme-selector">
          {TacticalThemes.map((t) => {
            const isOwned = !t.premium || currentUser?.inventory?.some(i => i.itemId === t.itemId);
            const isActive = currentUser?.theme === t.id;
            return (
              <div
                key={t.id}
                className="theme-swatch-wrapper"
                title={!isOwned ? `Unlock "${t.label}" in the Tactical Shop` : t.label}
              >
                <button
                  onClick={() => isOwned && !isUpdatingTheme && handleUpdateTheme(t.id)}
                  disabled={isUpdatingTheme || !isOwned}
                  className={`theme-swatch ${isActive ? 'active' : ''} ${isUpdatingTheme ? 'updating' : ''} ${!isOwned ? 'locked' : ''}`}
                  // dynamic per-theme colour — must stay inline
                  style={{
                    background: t.color,
                    boxShadow: isActive ? `0 0 15px ${t.glow}` : 'none',
                  }}
                >
                  {isActive && <span className="theme-swatch__check">✓</span>}
                  {t.premium && !isOwned && <span className="theme-swatch__lock">🔒</span>}
                </button>
              </div>
            );
          })}
          <a href="/shop" className="unlock-premium-link">⚡ Unlock Premium →</a>
        </div>
      </div>

      {/* ── Network / Cohort ── */}
      <div className="profile-card profile-card--spaced">
        <header className="profile-section-header">
          <h3 className="glow-text">
            {currentUser?.role === 'TEACHER' ? 'My Student Cohort' : 'My Academic Mentors'}
          </h3>
          <p>
            {currentUser?.role === 'TEACHER'
              ? 'Add and manage students recruited to your network.'
              : 'Teachers who have added you to their tasks.'}
          </p>
        </header>

        {currentUser?.role === 'TEACHER' && (
          <div className="add-student-form">
            <div className="input-group">
              <label>Recruit Student by Username</label>
              <div className="recruit-row">
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
                      fetchProfile();
                    } catch (err) { alert(err.response?.data?.message || err.message); }
                  }}
                  disabled={isLoading}
                  className="btn-primary recruit-btn"
                >
                  {isLoading ? '...' : 'Recruit'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="network-list">
          {currentUser?.role === 'TEACHER' ? (
            currentUser?.students?.length > 0
              ? currentUser.students.map(s => (
                <div key={s._id} className="network-card glass-card">
                  <p className="network-card__name">{s.name}</p>
                  <p className="network-card__username">@{s.username}</p>
                </div>
              ))
              : <p className="network-empty">No students in cohort yet.</p>
          ) : (
            currentUser?.teachers?.length > 0
              ? currentUser.teachers.map(t => (
                <div key={t._id} className="network-card glass-card">
                  <p className="network-card__name">{t.name}</p>
                  <p className="network-card__username">@{t.username}</p>
                </div>
              ))
              : <p className="network-empty">No linked mentors yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

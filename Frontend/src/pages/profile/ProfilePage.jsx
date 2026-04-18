import { useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../lib/api';
import { User, Camera, Save, Mail, GraduationCap } from 'lucide-react';
import GlassDropdown from '../../components/ui/GlassDropdown';

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    board: user?.boardInfo?.board || 'NONE',
    class: user?.boardInfo?.class || '10',
  });

  const boardOptions = [
    { value: 'CBSE', label: 'CBSE' },
    { value: 'ICSE', label: 'ICSE' },
    { value: 'WB', label: 'WB Board' },
    { value: 'NONE', label: 'None' }
  ];

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setSuccess('');
      const { data } = await api.put('/user/profile', {
        name: formData.name,
        boardInfo: {
          board: formData.board,
          class: formData.class
        }
      });
      setUser(data.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      setLoading(true);
      const { data } = await api.post('/user/upload-profile-pic', uploadData);
      const userRes = await api.get('/user/profile');
      setUser(userRes.data.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
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
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Profile" />
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
            <h2>{user?.name}</h2>
            <p className="email-text">
              <Mail size={14} /> {user?.email}
            </p>
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

          <button type="submit" disabled={loading} className="btn-primary flex-center" style={{ marginTop: '1rem', gap: '0.5rem' }}>
            {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

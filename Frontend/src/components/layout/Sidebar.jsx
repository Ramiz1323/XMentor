import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, BookOpen, Settings, LayoutDashboard, X, Target, HelpCircle, Trophy, Download } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`} 
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`glass-sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <button className="mobile-close" onClick={onClose} aria-label="Close sidebar">
            <X size={24} />
          </button>
          
          <div className="user-info">
            <div className="avatar-mini">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/" 
            onClick={handleLinkClick}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} aria-hidden="true" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/communities" 
            onClick={handleLinkClick}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Users size={20} aria-hidden="true" />
            <span>Communities</span>
          </NavLink>

          <NavLink 
            to="/doubts" 
            onClick={handleLinkClick}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <HelpCircle size={20} aria-hidden="true" />
            <span>Doubt Section</span>
          </NavLink>

          <div className="sidebar-divider" role="presentation">Tasks</div>

          <NavLink 
            to="/mcq" 
            onClick={handleLinkClick}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Target size={20} aria-hidden="true" />
            <span>MCQ Hub</span>
          </NavLink>

          <NavLink 
            to="/leaderboard" 
            onClick={handleLinkClick}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Trophy size={20} aria-hidden="true" />
            <span>Leaderboard</span>
          </NavLink>

          <div className="sidebar-divider" role="presentation">Settings</div>

          <NavLink 
            to="/profile" 
            onClick={handleLinkClick}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Settings size={20} aria-hidden="true" />
            <span>Profile Settings</span>
          </NavLink>
        </nav>

        {deferredPrompt && (
          <div className="sidebar-footer">
            <button className="install-button glass-card" onClick={handleInstall}>
              <Download size={18} />
              <span>Install XMentor</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;

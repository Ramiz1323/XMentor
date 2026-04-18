import { NavLink } from 'react-router-dom';
import { Users, BookOpen, Settings, LayoutDashboard, X, Target } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();

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
              {user?.name?.charAt(0) || 'U'}
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

          <div className="sidebar-divider" role="presentation">Tasks</div>

          <NavLink 
            to="/mcq-hub" 
            onClick={handleLinkClick}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Target size={20} aria-hidden="true" />
            <span>MCQ Hub</span>
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

        <div className="sidebar-footer">
          <div className="rank-badge">
            <span className="label">Rank</span>
            <span className="value">Novice</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

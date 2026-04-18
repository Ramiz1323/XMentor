import { NavLink } from 'react-router-dom';
import { Home, Users, BookOpen, Settings, LayoutDashboard } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Sidebar = () => {
  const { user } = useAuthStore();

  return (
    <aside className="glass-sidebar">
      <div className="sidebar-header">
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
        <NavLink to="/" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/communities" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Communities</span>
        </NavLink>

        <div className="sidebar-divider">Missions</div>

        <NavLink to="/tests" className={({ isActive }) => `sidebar-item disabled ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>All Tests</span>
        </NavLink>

        <div className="sidebar-divider">Settings</div>

        <NavLink to="/profile" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
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
  );
};

export default Sidebar;

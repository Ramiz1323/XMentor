import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import logo from '../../assets/logo.png';
import { LogOut, Bell, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { isAuthenticated, logout, isLoading } = useAuthStore();
  // Mock notification state - in a real app this would come from a notification store or API
  const [hasNotifications] = useState(true);

  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to terminate your strategic session?')) {
      await logout();
      navigate('/');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="glass-navbar">
      <div className="nav-content">
        <div className="brand-section">
          <button 
            className="menu-toggle" 
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick();
            }}
            aria-label="Toggle navigation menu"
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="nav-logo" aria-label="XMentor Home">
            <span className="glow-text">XMentor</span>
          </Link>
        </div>

        <div className="nav-actions">
          <button 
            className="icon-btn" 
            aria-label={hasNotifications ? "Notifications (new items available)" : "Notifications (none)"}
            aria-live="polite"
          >
            <Bell size={20} />
            {hasNotifications && <span className="notification-dot" aria-hidden="true"></span>}
          </button>

          <button 
            onClick={handleLogout} 
            disabled={isLoading}
            className={`logout-btn header-logout ${isLoading ? 'loading' : ''}`}
            aria-label="Terminate current session"
          >
            <LogOut size={18} />
            <span className="btn-text">{isLoading ? 'Logging out...' : 'Log Out'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

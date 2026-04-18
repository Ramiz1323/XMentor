import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import logo from '../../assets/logo.png';
import { LogOut, Bell, Search } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuthStore();
  // Mock notification state - in a real app this would come from a notification store or API
  const [hasNotifications] = useState(true);

  if (!isAuthenticated) return null;

  return (
    <nav className="glass-navbar">
      <div className="nav-content">
        <Link to="/" className="nav-logo" aria-label="XMentor Home">
          <img src={logo} alt="XMentor" />
          <span className="glow-text">XMentor</span>
        </Link>

        <div className="nav-actions">
          <div className="search-bar">
            <Search size={16} aria-hidden="true" />
            <input 
              type="text" 
              placeholder="Search mission..." 
              aria-label="Search missions"
            />
          </div>
          
          <button 
            className="icon-btn" 
            aria-label={hasNotifications ? "Notifications (new items available)" : "Notifications (none)"}
            aria-live="polite"
          >
            <Bell size={20} />
            {hasNotifications && <span className="notification-dot" aria-hidden="true"></span>}
          </button>

          <button 
            onClick={logout} 
            className="logout-btn header-logout"
            aria-label="Terminate current session"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

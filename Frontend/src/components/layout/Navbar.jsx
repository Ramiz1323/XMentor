import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { LogOut, Bell, Menu, Zap } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { isAuthenticated, logout, isLoading, user } = useAuthStore();
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
          {/* ── Pts Wallet Pill ── */}
          <Link to="/shop" className="pts-pill" aria-label={`${user?.points ?? 150} Pts — Visit Tactical Shop`}>
            <span className="pts-pill__orb" />
            <Zap size={13} className="pts-pill__icon" />
            <span className="pts-pill__value">{user?.points ?? 150}</span>
            <span className="pts-pill__label">PTS</span>
          </Link>

          <button
            className="icon-btn"
            aria-label={hasNotifications ? 'Notifications (new items available)' : 'Notifications (none)'}
            aria-live="polite"
          >
            <Bell size={20} />
            {hasNotifications && <span className="notification-dot" aria-hidden="true" />}
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

import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import logo from '../../assets/logo.png';
import { LogOut, Bell, Search } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) return null;

  return (
    <nav className="glass-navbar">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          <img src={logo} alt="XMentor" />
          <span className="glow-text">XMentor</span>
        </Link>

        <div className="nav-actions">
          <div className="search-bar">
            <Search size={16} />
            <input type="text" placeholder="Search mission..." />
          </div>
          
          <button className="icon-btn">
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>

          <button onClick={logout} className="logout-btn header-logout">
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

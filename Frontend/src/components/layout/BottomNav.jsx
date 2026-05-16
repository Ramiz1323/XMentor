import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  BookOpen, 
  Menu, 
  X, 
  Trophy, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Settings, 
  Download, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const BottomNav = () => {
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle PWA Install Prompt
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

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to terminate your strategic session?')) {
      setIsMenuOpen(false);
      await logout();
      navigate('/');
    }
  };

  // Close menu sheet on route navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Check if any menu sheet route is currently active
  const isMenuRouteActive = ['/communities', '/doubts', '/subjective/review', '/admin', '/profile'].some(route => 
    location.pathname === route || location.pathname.startsWith(`${route}/`)
  );

  return (
    <>
      {/* ── Fixed Bottom Navigation Bar (Mobile / Tablet <= 1024px) ── */}
      <nav className="modern-downbar">
        <div className="downbar-items">
          <NavLink
            to="/"
            className={({ isActive }) => `downbar-item ${isActive ? 'active' : ''}`}
            aria-label="Dashboard"
          >
            <LayoutDashboard size={22} />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/mcq"
            end
            className={({ isActive }) => `downbar-item ${isActive ? 'active' : ''}`}
            aria-label="MCQ Hub"
          >
            <Target size={22} />
            <span>Mcq</span>
          </NavLink>

          <NavLink
            to="/leaderboard"
            className={({ isActive }) => `downbar-item ${isActive ? 'active' : ''}`}
            aria-label="Leaderboard"
          >
            <Trophy size={22} />
            <span>Leaderboard</span>
          </NavLink>

          <NavLink
            to="/subjective"
            end
            className={({ isActive }) => `downbar-item ${isActive ? 'active' : ''}`}
            aria-label="Subjective Hub"
          >
            <BookOpen size={22} />
            <span>Tasks</span>
          </NavLink>

          <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            className={`downbar-item menu-tab-btn ${(isMenuOpen || isMenuRouteActive) ? 'active' : ''}`}
            aria-label="More Menu"
          >
            <Menu size={22} />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {/* ── Slide-up Menu Bottom Sheet (Line by Line Rows) ── */}
      <div 
        className={`menu-sheet-overlay ${isMenuOpen ? 'show' : ''}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      <div className={`menu-bottom-sheet ${isMenuOpen ? 'open' : ''}`}>
        <div className="sheet-header">
          <div className="sheet-drag-handle" />
          <div className="sheet-header-content">
            <div className="user-info-pill">
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
            <button className="sheet-close-btn" onClick={() => setIsMenuOpen(false)}>
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="sheet-body">
          <div className="sheet-nav-list">
            <NavLink to="/communities" className={({ isActive }) => `sheet-nav-row ${isActive ? 'active' : ''}`} style={{ '--row-idx': 1 }}>
              <div className="row-left">
                <div className="item-icon-box"><Users size={20} /></div>
                <span>Chats</span>
              </div>
              <ChevronRight size={18} className="row-chevron" />
            </NavLink>

            <NavLink to="/doubts" className={({ isActive }) => `sheet-nav-row ${isActive ? 'active' : ''}`} style={{ '--row-idx': 2 }}>
              <div className="row-left">
                <div className="item-icon-box"><HelpCircle size={20} /></div>
                <span>Doubt Section</span>
              </div>
              <ChevronRight size={18} className="row-chevron" />
            </NavLink>

            {user?.role === 'TEACHER' && (
              <NavLink to="/subjective/review" className={({ isActive }) => `sheet-nav-row ${isActive ? 'active' : ''}`} style={{ '--row-idx': 3 }}>
                <div className="row-left">
                  <div className="item-icon-box"><CheckCircle2 size={20} /></div>
                  <span>Review Center</span>
                </div>
                <ChevronRight size={18} className="row-chevron" />
              </NavLink>
            )}

            {user?.isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `sheet-nav-row admin-link ${isActive ? 'active' : ''}`} style={{ '--row-idx': 4 }}>
                <div className="row-left">
                  <div className="item-icon-box"><ShieldCheck size={20} /></div>
                  <span>Admin Operations</span>
                </div>
                <ChevronRight size={18} className="row-chevron" />
              </NavLink>
            )}

            <NavLink to="/profile" className={({ isActive }) => `sheet-nav-row ${isActive ? 'active' : ''}`} style={{ '--row-idx': 5 }}>
              <div className="row-left">
                <div className="item-icon-box"><Settings size={20} /></div>
                <span>Profile Settings</span>
              </div>
              <ChevronRight size={18} className="row-chevron" />
            </NavLink>
          </div>

          <div className="sheet-footer-actions" style={{ '--row-idx': 6 }}>
            {deferredPrompt && (
              <button className="sheet-action-btn install-btn" onClick={handleInstall}>
                <Download size={18} />
                <span>Install XMentor App</span>
              </button>
            )}

            <button className="sheet-action-btn logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>

          <div className="sheet-watermark">
            <span>© {new Date().getFullYear()} Ramiz. · v1.1.0</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNav;

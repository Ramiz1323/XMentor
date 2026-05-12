import { RefreshCw, ShieldAlert, MessageCircle, Clock, UserCheck, Phone } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const PendingVerificationPage = () => {
  const { user, checkAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleRefresh = async () => {
    await checkAuth();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="maintenance-page verification-pending">
      <div className="maintenance-content glass-card">
        <div className="maintenance-visual">
          <div className="server-container verification-container">
            <ShieldAlert size={64} className="server-icon pulse-yellow" />
            <div className="scan-line-v"></div>
            <div className="status-dots">
              <span className="dot yellow"></span>
              <span className="dot yellow"></span>
              <span className="dot yellow"></span>
            </div>
          </div>
          <div className="gear-container">
            <Clock size={32} className="gear-icon gear-1" />
            <UserCheck size={24} className="gear-icon gear-2" />
          </div>
        </div>

        <div className="maintenance-text">
          <h1 className="glow-text yellow">Verification Pending</h1>
          <h2>Tactical Credentials Under Review</h2>
          <p>
            Greetings, <strong>{user?.name}</strong>. Your request for Teacher access is currently being processed by 
            Central Command. To ensure the integrity of our neural network, manual verification is required.
          </p>
        </div>

        <div className="verification-info-card glass-panel">
          <div className="info-item">
            <Phone size={18} className="text-yellow" />
            <span>Registered Number: <strong>{user?.phoneNumber || 'Not Provided'}</strong></span>
          </div>
          <p className="hint-text">
            Once verified, you will receive a manual notification via WhatsApp on this number.
          </p>
        </div>

        <div className="action-grid-v">
          <button onClick={handleRefresh} className="btn-primary retry-btn">
            <RefreshCw size={20} className="icon-spin" />
            <span>Check Status</span>
          </button>
          
          <a 
            href={`https://wa.me/916289338509?text=Hello%20Admin,%20I%20have%20registered%20as%20a%20Teacher%20on%20XMentor.%20My%20email%20is%20${user?.email}.%20Please%20verify%20my%20account.`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-sec whatsapp-btn"
          >
            <MessageCircle size={20} />
            <span>Contact Admin</span>
          </a>
        </div>

        <button onClick={handleLogout} className="logout-text-btn">
          Sign out and try another account
        </button>
      </div>

      <div className="maintenance-bg-decor">
        <div className="grid-overlay"></div>
        <div className="glow-orb orb-yellow"></div>
        <div className="glow-orb orb-2"></div>
      </div>
    </div>
  );
};

export default PendingVerificationPage;

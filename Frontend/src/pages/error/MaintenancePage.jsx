import { RefreshCw, Server, AlertCircle, Settings } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const MaintenancePage = () => {
  const { setServerDown, checkAuth } = useAuthStore();

  const handleRetry = async () => {
    try {
      await checkAuth();
      setServerDown(false);
    } catch (err) {
      console.log('Server still unreachable');
    }
  };

  return (
    <div className="maintenance-page">
      <div className="maintenance-content glass-card">
        <div className="maintenance-visual">
          <div className="server-container">
            <Server size={64} className="server-icon" />
            <div className="scan-line"></div>
            <div className="status-dots">
              <span className="dot red"></span>
              <span className="dot red"></span>
              <span className="dot red"></span>
            </div>
          </div>
          <div className="gear-container">
            <Settings size={32} className="gear-icon gear-1" />
            <Settings size={24} className="gear-icon gear-2" />
          </div>
        </div>

        <div className="maintenance-text">
          <h1 className="glow-text">System Maintenance</h1>
          <h2>Sector Offline</h2>
          <p>Our neural servers are currently undergoing a tactical recalibration. We'll be back online shortly to continue your training.</p>
        </div>

        <div className="maintenance-status auth-error">
          <AlertCircle size={18} />
          <span>Connection Lost</span>
        </div>

        <button onClick={handleRetry} className="btn-primary retry-btn">
          <RefreshCw size={20} className="icon-spin" />
          <span>Retry Connection</span>
        </button>
      </div>

      <div className="maintenance-bg-decor">
        <div className="grid-overlay"></div>
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>
    </div>
  );
};

export default MaintenancePage;

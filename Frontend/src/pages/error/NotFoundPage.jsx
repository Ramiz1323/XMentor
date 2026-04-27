import { Link } from 'react-router-dom';
import { Home, AlertTriangle, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="error-page">
      <div className="error-content glass-card">
        <div className="error-icon-wrapper">
          <AlertTriangle size={64} className="glow-icon-error" />
        </div>
        
        <div className="error-text">
          <h1 className="glow-text">404</h1>
          <h2>Page Not Found</h2>
          <p>The tactical data you are looking for does not exist or has been moved to a classified sector.</p>
        </div>

        <div className="error-actions">
          <Link to="/" className="btn-primary">
            <Home size={20} />
            <span>Return to Dashboard</span>
          </Link>
          
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </button>
        </div>
      </div>

      <div className="error-background-decor">
        <div className="decor-circle circle-1"></div>
        <div className="decor-circle circle-2"></div>
      </div>
    </div>
  );
};

export default NotFoundPage;

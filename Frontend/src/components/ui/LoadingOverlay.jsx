import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = ({ message = 'Synchronising Tactical Data...' }) => {
  return (
    <div 
      className="loading-overlay-container"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      <div className="loading-content">
        <div className="loader-ring">
          <Loader2 className="spinning-icon" size={48} />
          <div className="inner-pulse" />
        </div>
        <p className="loading-message glow-text">{message}</p>
        <div className="scanning-bar" />
      </div>
    </div>
  );
};

export default LoadingOverlay;

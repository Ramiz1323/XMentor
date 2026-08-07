import React, { Component } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-wrapper">
          <div className="error-card">
            <div className="error-icon-box">
              <AlertOctagon size={40} />
            </div>

            <h2 className="error-heading">
              System Exception Encountered
            </h2>
            
            <p className="error-msg">
              {this.state.error?.message || 'An unexpected rendering error occurred. The application has safely caught the exception.'}
            </p>

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-reload">
                <RotateCcw size={16} /> Reload Page
              </button>
              
              <button onClick={this.handleGoHome} className="btn-home">
                <Home size={16} /> Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

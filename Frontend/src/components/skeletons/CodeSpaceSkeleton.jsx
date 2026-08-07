import React from 'react';
import { Code2, Loader2, Sparkles } from 'lucide-react';

const CodeSpaceSkeleton = () => {
  return (
    <div className="codespace-container codespace-skeleton-wrapper">
      {/* ── Top Header Toolbar Skeleton ── */}
      <header className="codespace-header">
        <div className="skeleton-header-left">
          <div className="skeleton-brand">
            <Code2 size={20} />
            <span>XMentor CodeSpace</span>
          </div>
          <div className="skeleton-lang-group">
            <div className="skeleton" style={{ width: '80px', height: '28px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ width: '80px', height: '28px', borderRadius: '6px' }} />
          </div>
        </div>

        <div className="skeleton-header-right">
          <div className="skeleton" style={{ width: '90px', height: '32px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ width: '90px', height: '32px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ width: '110px', height: '24px', borderRadius: '4px' }} />
        </div>
      </header>

      {/* ── Main Workspace Skeleton Body ── */}
      <div className="skeleton-workspace-grid">
        
        {/* Loading Overlay Center Badge */}
        <div className="skeleton-overlay-badge">
          <Loader2 size={24} className="spin" style={{ color: '#38bdf8' }} />
          <div>
            <div className="overlay-title">
              <Sparkles size={14} style={{ color: '#38bdf8' }} /> Restoring Workspace...
            </div>
            <div className="overlay-sub">
              Fetching latest codes & settings from cloud
            </div>
          </div>
        </div>

        {/* Left Pane: Code Editor Skeleton */}
        <div className="skeleton-pane">
          <div className="skeleton-tab-group">
            <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: '6px' }} />
          </div>

          <div className="skeleton-code-lines">
            <div className="skeleton" style={{ width: '40%', height: '16px' }} />
            <div className="skeleton" style={{ width: '70%', height: '16px' }} />
            <div className="skeleton" style={{ width: '55%', height: '16px' }} />
            <div className="skeleton" style={{ width: '80%', height: '16px' }} />
            <div className="skeleton" style={{ width: '30%', height: '16px' }} />
            <div className="skeleton" style={{ width: '65%', height: '16px' }} />
            <div className="skeleton" style={{ width: '50%', height: '16px' }} />
          </div>
        </div>

        {/* Right Pane: Live Output Preview Skeleton */}
        <div className="skeleton-pane">
          <div style={{ height: '32px' }}>
            <div className="skeleton" style={{ width: '120px', height: '20px' }} />
          </div>

          <div className="skeleton-preview-box">
            <div className="skeleton circle" style={{ width: '160px', height: '160px' }} />
            <div className="skeleton" style={{ width: '200px', height: '24px' }} />
            <div className="skeleton" style={{ width: '140px', height: '16px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeSpaceSkeleton;

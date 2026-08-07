import React from 'react';
import { Code2, Loader2, Sparkles } from 'lucide-react';

const CodeSpaceSkeleton = () => {
  return (
    <div className="codespace-container codespace-skeleton-wrapper" style={{ height: 'calc(100vh - 80px)', background: '#090d16', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Header Toolbar Skeleton ── */}
      <header className="codespace-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1.25rem', background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#38bdf8', fontWeight: 700 }}>
            <Code2 size={20} />
            <span>XMentor CodeSpace</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(30, 41, 59, 0.6)', padding: '0.25rem', borderRadius: '8px' }}>
            <div className="skeleton" style={{ width: '80px', height: '28px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ width: '80px', height: '28px', borderRadius: '6px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="skeleton" style={{ width: '90px', height: '32px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ width: '90px', height: '32px', borderRadius: '8px' }} />
          <div className="skeleton" style={{ width: '110px', height: '24px', borderRadius: '4px' }} />
        </div>
      </header>

      {/* ── Main Workspace Skeleton Body ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255, 255, 255, 0.05)', position: 'relative' }}>
        
        {/* Loading Overlay Center Badge */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          backdropFilter: 'blur(16px)',
          padding: '1.25rem 2rem',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
        }}>
          <Loader2 size={24} className="spin" style={{ color: '#38bdf8' }} />
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={14} style={{ color: '#38bdf8' }} /> Restoring Workspace...
            </div>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.15rem' }}>
              Fetching latest codes & settings from cloud
            </div>
          </div>
        </div>

        {/* Left Pane: Code Editor Skeleton */}
        <div style={{ background: '#090d16', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: '6px' }} />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px' }}>
            <div className="skeleton" style={{ width: '40%', height: '16px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '70%', height: '16px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '55%', height: '16px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '80%', height: '16px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '30%', height: '16px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '65%', height: '16px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '50%', height: '16px', borderRadius: '4px' }} />
          </div>
        </div>

        {/* Right Pane: Live Output Preview Skeleton */}
        <div style={{ background: '#090d16', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '32px' }}>
            <div className="skeleton" style={{ width: '120px', height: '20px', borderRadius: '4px' }} />
          </div>

          <div style={{ flex: 1, background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div className="skeleton" style={{ width: '160px', height: '160px', borderRadius: '16px' }} />
            <div className="skeleton" style={{ width: '200px', height: '24px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ width: '140px', height: '16px', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeSpaceSkeleton;

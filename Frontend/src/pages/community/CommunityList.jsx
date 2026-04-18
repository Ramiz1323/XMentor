import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';
import { Users, LogIn, LogOut, Search, RefreshCw, AlertCircle } from 'lucide-react';

const CommunityList = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState({}); // Track loading per community ID
  const { user } = useAuthStore();

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/community');
      setCommunities(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to sync with community mainframe');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleJoin = async (id) => {
    if (actionLoading[id]) return;
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await api.post(`/community/${id}/join`);
      await fetchCommunities();
    } catch (err) {
      alert(err.message || 'Task join failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleLeave = async (id) => {
    if (actionLoading[id]) return;
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await api.post(`/community/${id}/leave`);
      await fetchCommunities();
    } catch (err) {
      alert(err.message || 'Task exit failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const filtered = communities.filter(c => {
    const s = (search || '').toLowerCase();
    const name = (c?.name || '').toLowerCase();
    const type = (c?.type || '').toLowerCase();
    return name.includes(s) || type.includes(s);
  });

  if (error) {
    return (
      <div className="error-container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
        <h2 className="glow-text" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Signal Interference Detected</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>{error}</p>
        <button onClick={fetchCommunities} className="btn-primary" style={{ display: 'inline-flex', gap: '0.5rem' }}>
          <RefreshCw size={18} /> Retry Sync
        </button>
      </div>
    );
  }

  return (
    <div className="community-page">
      <div className="header-actions">
        <div className="header-text">
          <h1 className="glow-text">Learning Communities</h1>
          <p>Find and join groups that match your interests.</p>
        </div>
        <div className="search-wrapper">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search learning communities"
          />
        </div>
      </div>

      {loading ? (
        <div className="loader" style={{ textAlign: 'center', padding: '8rem', color: 'white' }}>Scanning Sector for Communities...</div>
      ) : (
        <div className="community-grid">
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', opacity: 0.5 }}>No tasks found in this sector.</div>
          ) : (
            filtered.map(community => {
              const isMember = community.members?.includes(user?._id);
              const isLoadingAction = actionLoading[community._id];

              return (
                <div key={community._id} className="community-card">
                  <div className="card-top">
                    <div>
                      <h3 style={{ fontSize: '1.25rem', color: 'white' }}>{community.name}</h3>
                      <span className="type-badge">{community.type}</span>
                    </div>
                    <div className="member-count">
                      <Users size={16} /> <span>{community.memberCount || 0}</span>
                    </div>
                  </div>

                  <p className="card-description">
                    {community.description}
                  </p>

                  <div className="card-footer">
                    {isMember ? (
                      <button 
                        onClick={() => handleLeave(community._id)} 
                        disabled={isLoadingAction}
                        className="leave-btn"
                        aria-busy={isLoadingAction}
                      >
                        <LogOut size={18} /> {isLoadingAction ? 'Processing...' : 'Leave'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleJoin(community._id)} 
                        disabled={isLoadingAction}
                        className="btn-primary"
                        aria-busy={isLoadingAction}
                      >
                        <LogIn size={18} /> {isLoadingAction ? 'Processing...' : 'Join Now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityList;

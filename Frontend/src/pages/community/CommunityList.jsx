import { useEffect, useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useCommunityStore from '../../store/useCommunityStore';
import { Users, LogIn, LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import CommunitySkeleton from '../../components/skeletons/CommunitySkeleton';

const CommunityList = () => {
  const { communities, fetchAllCommunities, joinCommunity, leaveCommunity, isLoading, error } = useCommunityStore();
  const [actionLoading, setActionLoading] = useState({}); 
  const { user } = useAuthStore();

  useEffect(() => {
    fetchAllCommunities();
  }, [fetchAllCommunities]);

  const handleJoin = async (id) => {
    if (actionLoading[id]) return;
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await joinCommunity(id);
      await fetchAllCommunities();
    } catch (err) {
      alert(err.message || 'Community join failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleLeave = async (id) => {
    if (actionLoading[id]) return;
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await leaveCommunity(id);
      await fetchAllCommunities();
    } catch (err) {
      alert(err.message || 'Community exit failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  if (error) {
    return (
      <div className="error-container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
        <h2 className="glow-text" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Signal Interference Detected</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>{error}</p>
        <button onClick={fetchAllCommunities} className="btn-primary" style={{ display: 'inline-flex', gap: '0.5rem' }}>
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
      </div>

      <div className="community-grid">
        {isLoading && !communities?.length ? (
          [...Array(6)].map((_, i) => <CommunitySkeleton key={i} />)
        ) : !communities?.length ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
            No communities discovered yet.
          </div>
        ) : (
          communities.map(community => {
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
    </div>
  );
};

export default CommunityList;

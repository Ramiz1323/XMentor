import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useCommunityStore from '../../store/useCommunityStore';
import { Users, LogIn, LogOut, RefreshCw, AlertCircle, MessageSquare, X, Plus, Trash2 } from 'lucide-react';
import CommunitySkeleton from '../../components/skeletons/CommunitySkeleton';

const CommunityList = () => {
  const { 
    communities, 
    fetchAllCommunities, 
    joinCommunity, 
    leaveCommunity, 
    createCommunity,
    deleteCommunity,
    isLoading, 
    error 
  } = useCommunityStore();
  const [actionLoading, setActionLoading] = useState({}); 
  const [showAliasModal, setShowAliasModal] = useState(null); 
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [aliasInput, setAliasInput] = useState('');
  const [createData, setCreateData] = useState({ name: '', description: '', type: 'BOARD', alias: 'Mentor' });
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllCommunities();
  }, [fetchAllCommunities]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(prev => ({ ...prev, creating: true }));
      const res = await createCommunity(createData);
      setShowCreateModal(false);
      setCreateData({ name: '', description: '', type: 'BOARD', alias: 'Mentor' });
      await fetchAllCommunities();
      navigate(`/communities/${res.data._id}/chat`);
    } catch (err) {
      alert(err.message || 'Failed to create community');
    } finally {
      setActionLoading(prev => ({ ...prev, creating: false }));
    }
  };

  const handleJoin = async () => {
    const id = showAliasModal;
    if (!aliasInput.trim() || actionLoading[id]) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await joinCommunity(id, aliasInput);
      setShowAliasModal(null);
      setAliasInput('');
      await fetchAllCommunities();
      navigate(`/communities/${id}/chat`);
    } catch (err) {
      alert(err.message || 'Community join failed');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleLeave = async (id, isTerminate = false) => {
    if (actionLoading[id]) return;
    
    const confirmMsg = isTerminate 
      ? 'CRITICAL: Terminate this community? This will erase all history and disconnect all members.'
      : 'Are you sure you want to leave this anonymous community?';

    if (!window.confirm(confirmMsg)) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      if (isTerminate) {
        await deleteCommunity(id);
      } else {
        await leaveCommunity(id);
      }
      await fetchAllCommunities();
    } catch (err) {
      alert(err.message || (isTerminate ? 'Termination failed' : 'Exit failed'));
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  if (error) {
    return (
      <div className="error-container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
        <h2 className="glow-text">Signal Interference Detected</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>{error}</p>
        <button onClick={fetchAllCommunities} className="btn-primary">
          <RefreshCw size={18} /> Retry Sync
        </button>
      </div>
    );
  }

  return (
    <div className="community-page">
      <div className="header-actions">
        <div className="header-text">
          <h1 className="glow-text">Anonymous Hubs</h1>
          <p>Communicate freely with your cohort using secure aliases.</p>
        </div>
        {user?.role?.toUpperCase() === 'TEACHER' && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary create-hub-btn">
            <Plus size={18} /> Create Hub
          </button>
        )}
      </div>

      <div className="community-grid">
        {isLoading && !communities?.length ? (
          [...Array(6)].map((_, i) => <CommunitySkeleton key={i} />)
        ) : !communities?.length ? (
          <div className="empty-state-msg">No anonymous communities discovered yet.</div>
        ) : (
          communities.map(community => {
            const uId = (user?._id || user?.id)?.toString();
            const isMember = community.isMember;
            const isCreator = (community.createdBy?._id || community.createdBy)?.toString() === uId;
            const isLoadingAction = actionLoading[community._id];

            return (
              <div key={community._id} className={`community-card ${isMember ? 'member' : ''}`}>
                <div className="card-top">
                  <div>
                    <h3 className="community-name">{community.name}</h3>
                    <span className="type-badge">{community.type}</span>
                  </div>
                  <div className="member-count">
                    <Users size={16} /> <span>{community.memberCount || 0}</span>
                  </div>
                </div>

                <p className="card-description">{community.description}</p>

                <div className="card-footer">
                  <div className="btn-group">
                    {isMember ? (
                      <button 
                        onClick={() => navigate(`/communities/${community._id}/chat`)}
                        className="btn-primary chat-btn"
                      >
                        <MessageSquare size={18} /> Enter Chat
                      </button>
                    ) : (
                      <button 
                        onClick={() => setShowAliasModal(community._id)} 
                        disabled={actionLoading[community._id]}
                        className="btn-primary join-btn"
                      >
                        <LogIn size={18} /> Join Anonymously
                      </button>
                    )}

                    {isCreator && (
                      <button 
                        onClick={() => handleLeave(community._id, true)} 
                        disabled={isLoadingAction}
                        className={`leave-btn-icon delete-btn ${isLoadingAction ? 'loading' : ''}`}
                        title="Terminate Community"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}

                    {isMember && (
                      <button 
                        onClick={() => handleLeave(community._id)} 
                        disabled={isLoadingAction}
                        className="leave-btn-icon"
                        title="Leave Community"
                      >
                        <LogOut size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAliasModal && (
        <div className="modal-overlay">
          <div className="glass-card alias-modal">
            <div className="modal-header">
              <h3>Secure Identity Setup</h3>
              <button onClick={() => setShowAliasModal(null)} className="close-btn"><X size={20} /></button>
            </div>
            <p>Choose a custom alias for this community. Real names will remain hidden.</p>
            <div className="input-group">
              <input 
                type="text" 
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                placeholder="e.g. CyberNinja42"
                maxLength={30}
                autoFocus
              />
              <button 
                onClick={handleJoin}
                disabled={!aliasInput.trim() || actionLoading[showAliasModal]}
                className="btn-primary"
              >
                Confirm Identity
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="glass-card create-modal">
            <div className="modal-header">
              <h3>Establish New Hub</h3>
              <button onClick={() => setShowCreateModal(false)} className="close-btn"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="create-form">
              <div className="input-group">
                <label>Hub Name</label>
                <input 
                  type="text" 
                  required
                  value={createData.name}
                  onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                  placeholder="e.g. Tactical Strategy Room"
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea 
                  required
                  value={createData.description}
                  onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                  placeholder="What's this hub for?"
                  rows={3}
                />
              </div>
              <div className="input-group">
                <label>Mentor Alias (Your Identity)</label>
                <input 
                  type="text" 
                  required
                  value={createData.alias}
                  onChange={(e) => setCreateData({ ...createData, alias: e.target.value })}
                  placeholder="e.g. CommandNode"
                />
              </div>
              <div className="input-group">
                <label>Hub Type</label>
                <select 
                  value={createData.type}
                  onChange={(e) => setCreateData({ ...createData, type: e.target.value })}
                >
                  <option value="BOARD">BOARD (General Discussion)</option>
                  <option value="DEV">DEV (Technical Lab)</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={actionLoading.creating}
                className="btn-primary full-width"
              >
                {actionLoading.creating ? 'Initializing...' : 'Manifest Hub'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityList;

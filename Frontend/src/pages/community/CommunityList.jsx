import { useEffect, useState } from 'react';
import api from '../../lib/api';
import useAuthStore from '../../store/useAuthStore';
import { Users, LogIn, LogOut, Search } from 'lucide-react';

const CommunityList = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/community');
      setCommunities(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleJoin = async (id) => {
    try {
      await api.post(`/community/${id}/join`);
      fetchCommunities();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLeave = async (id) => {
    try {
      await api.post(`/community/${id}/leave`);
      fetchCommunities();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = communities.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="community-page">
      <div className="header-actions">
        <div className="header-text">
          <h1 className="glow-text">Learning Communities</h1>
          <p>Find and join groups that match your interests.</p>
        </div>
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'white' }}>Loading communities...</div>
      ) : (
        <div className="community-grid">
          {filtered.map(community => {
            const isMember = community.members?.includes(user?._id);

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
                    <button onClick={() => handleLeave(community._id)} className="leave-btn">
                      <LogOut size={18} /> Leave
                    </button>
                  ) : (
                    <button onClick={() => handleJoin(community._id)} className="btn-primary">
                      <LogIn size={18} /> Join Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunityList;

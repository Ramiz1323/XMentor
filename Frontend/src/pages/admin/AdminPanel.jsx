import { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, Clock, Phone, Mail, Search, CheckCircle, XCircle, Loader2, MessageCircle, RefreshCw } from 'lucide-react';
import userService from '../../services/user.service';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await userService.getPendingTeachers();
      setPendingTeachers(res.data);
    } catch (err) {
      toast.error('Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      setProcessingId(id);
      await userService.verifyTeacher(id);
      toast.success('Teacher verified successfully');
      setPendingTeachers(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTeachers = pendingTeachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="admin-panel animate-fade-in">
      <div className="panel-header">
        <div className="header-title">
          <ShieldCheck className="text-accent" size={28} />
          <h1>Admin Operations</h1>
        </div>
        <p>Review and verify strategic personnel credentials</p>
      </div>

      <div className="stats-strip">
        <div className="stat-card glass-card">
          <Clock className="text-yellow" size={20} />
          <div className="stat-info">
            <span className="stat-value">{pendingTeachers.length}</span>
            <span className="stat-label">Pending Requests</span>
          </div>
        </div>
      </div>

      <div className="data-controls">
        <div className="search-wrapper glass-input">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={fetchPending} className="refresh-btn" disabled={loading}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="requests-grid">
        {loading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" size={40} />
            <p>Scanning Neural Records...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="empty-state glass-card">
            <CheckCircle size={48} className="text-success opacity-50" />
            <h3>No Pending Requests</h3>
            <p>All teacher credentials have been processed.</p>
          </div>
        ) : (
          filteredTeachers.map(teacher => (
            <div key={teacher._id} className="teacher-request-card glass-card animate-slide-up">
              <div className="card-header">
                <div className="user-info">
                  <h3>{teacher.name}</h3>
                  <span className="username">@{teacher.username}</span>
                </div>
                <div className="status-badge pending">Pending</div>
              </div>

              <div className="card-body">
                <div className="detail-row">
                  <Mail size={14} />
                  <span>{teacher.email}</span>
                </div>
                <div className="detail-row">
                  <Phone size={14} />
                  <span>{teacher.phoneNumber}</span>
                </div>
                <div className="detail-row">
                  <Clock size={14} />
                  <span>Requested: {new Date(teacher.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  onClick={() => handleVerify(teacher._id)}
                  disabled={processingId === teacher._id}
                  className="btn-verify"
                >
                  {processingId === teacher._id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UserCheck size={16} />
                  )}
                  <span>Approve Teacher</span>
                </button>
                <a 
                  href={`https://wa.me/${teacher.phoneNumber.replace(/[^0-9]/g, '')}?text=Hello%20${teacher.name},%20this%20is%20the%20XMentor%20Admin.%20Regarding%20your%20teacher%20registration...`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  <MessageCircle size={16} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

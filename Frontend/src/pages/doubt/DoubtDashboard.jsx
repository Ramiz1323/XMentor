import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  X, 
  Send, 
  HelpCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useDoubtStore from '../../store/useDoubtStore';

const DoubtDashboard = () => {
  const { user } = useAuthStore();
  const { doubts, fetchDoubts, askDoubt, resolveDoubt, isLoading, error } = useDoubtStore();
  
  const [filter, setFilter] = useState({ status: '', subject: '' });
  const [showAskModal, setShowAskModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(null);
  
  // Ask Doubt Form State
  const [askData, setAskData] = useState({
    teacherId: '',
    title: '', // This will be Chapter Name
    description: '',
    subject: '',
    priority: 'MEDIUM'
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Resolve Doubt State
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    fetchDoubts(filter);
  }, [fetchDoubts, filter]);

  const handleAskSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('teacherId', askData.teacherId);
      formData.append('title', askData.title);
      formData.append('description', askData.description);
      formData.append('subject', askData.subject);
      formData.append('priority', askData.priority);
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      await askDoubt(formData);
      setShowAskModal(false);
      setAskData({ teacherId: '', title: '', description: '', subject: '', priority: 'MEDIUM' });
      setSelectedFile(null);
    } catch (err) {
      // Error handled by store
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    try {
      await resolveDoubt(showResolveModal._id, answer);
      setShowResolveModal(null);
      setAnswer('');
    } catch (err) {
      // Error handled by store
    }
  };

  const isTeacher = user?.role === 'TEACHER';

  return (
    <div className="doubt-page">
      <div className="header-actions">
        <div className="header-text">
          <h1 className="glow-text">Doubt Central</h1>
          <p>Secure inquiry channel with your assigned mentors.</p>
        </div>
        {!isTeacher && (
          <button onClick={() => setShowAskModal(true)} className="btn-primary ask-btn">
            <Plus size={18} /> Ask a Doubt
          </button>
        )}
      </div>

      <div className="filters-bar glass-card">
        <div className="filter-group">
          <label>Filter by Status</label>
          <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
            <option value="">All Doubts</option>
            <option value="PENDING">Pending Approval</option>
            <option value="RESOLVED">Resolved / Answered</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Academic Subject</label>
          <select value={filter.subject} onChange={(e) => setFilter({ ...filter, subject: e.target.value })}>
            <option value="">All Academic Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="Computer Science">Computer Science</option>
          </select>
        </div>
      </div>

      {error && <div className="error-msg"><AlertCircle size={18} /> {error}</div>}

      <div className="doubts-grid">
        {isLoading && !doubts.length ? (
          <div className="loader">Syncing Doubts...</div>
        ) : doubts.length === 0 ? (
          <div className="empty-state">No doubts found matching your criteria.</div>
        ) : (
          doubts.map(doubt => (
            <div 
              key={doubt._id} 
              className={`doubt-card ${doubt.status}`}
              onClick={() => isTeacher && doubt.status === 'PENDING' ? setShowResolveModal(doubt) : null}
            >
              <div className="card-header">
                <span className="subject-tag">{doubt.subject}</span>
                <span className={`status-badge ${doubt.status}`}>
                  {doubt.status === 'PENDING' ? <Clock size={14} /> : <CheckCircle size={14} />}
                  {doubt.status}
                </span>
              </div>
              <h3 className="doubt-title">{doubt.title}</h3>
              <p className="doubt-preview">{doubt.description}</p>
              
              {doubt.status === 'RESOLVED' && (
                <div className="resolution-section">
                  <div className="res-header">
                    <MessageSquare size={14} /> <span>Mentor Answer</span>
                  </div>
                  <p className="res-content">{doubt.answer?.content}</p>
                </div>
              )}

              {doubt.attachments?.length > 0 && (
                <div className="doubt-attachment">
                  <img src={doubt.attachments[0]} alt="Doubt attachment" />
                </div>
              )}

              <div className="card-footer">
                <div className="user-info">
                  <div className="avatar-mini">
                    {isTeacher ? (
                      doubt.student?.profilePic ? <img src={doubt.student.profilePic} alt="" /> : <span>{doubt.student?.name?.charAt(0)}</span>
                    ) : (
                      doubt.teacher?.profilePic ? <img src={doubt.teacher.profilePic} alt="" /> : <span>{doubt.teacher?.name?.charAt(0)}</span>
                    )}
                  </div>
                  <span>{isTeacher ? doubt.student?.name : `Mentor: ${doubt.teacher?.name}`}</span>
                </div>
                <span className="timestamp">{new Date(doubt.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ask Doubt Modal */}
      {showAskModal && (
        <div className="modal-overlay">
          <div className="glass-card ask-doubt-modal">
            <div className="modal-header">
              <h2>Ask a Doubt</h2>
              <button onClick={() => setShowAskModal(false)} className="close-btn"><X size={20} /></button>
            </div>
            <form onSubmit={handleAskSubmit} className="doubt-form">
              <div className="form-group">
                <label>Mentor</label>
                <select 
                  required 
                  value={askData.teacherId} 
                  onChange={(e) => setAskData({ ...askData, teacherId: e.target.value })}
                >
                  <option value="">Select Authorized Mentor</option>
                  {user?.teachers?.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select 
                  required 
                  value={askData.subject} 
                  onChange={(e) => setAskData({ ...askData, subject: e.target.value })}
                >
                  <option value="">Select Academic Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>
              <div className="form-group">
                <label>Chapter Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Asymptotic Notation or Thermodynamics"
                  value={askData.title}
                  onChange={(e) => setAskData({ ...askData, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Upload Image (Optional)</label>
                <div className="file-upload-wrapper">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    id="doubt-image"
                  />
                  <label htmlFor="doubt-image" className="file-label">
                    {selectedFile ? selectedFile.name : 'Choose an image...'}
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  required 
                  placeholder="Provide context and specific areas where you need clarification..."
                  value={askData.description}
                  onChange={(e) => setAskData({ ...askData, description: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary full-width" disabled={isLoading}>
                {isLoading ? 'Transmitting...' : 'Manifest Inquiry'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Doubt Modal */}
      {showResolveModal && (
        <div className="modal-overlay">
          <div className="glass-card resolve-modal">
            <div className="modal-header">
              <div className="header-title-group">
                <MessageSquare className="header-icon" />
                <h2>Resolve Doubt</h2>
              </div>
              <button onClick={() => setShowResolveModal(null)} className="close-btn-ghost"><X size={20} /></button>
            </div>
            
            <div className="doubt-context-ticket">
              <div className="ticket-meta">
                <span className="subject">{showResolveModal.subject}</span>
                <span className="divider">|</span>
                <span className="chapter">{showResolveModal.title}</span>
                <span className="divider">|</span>
                <span className="student">By {showResolveModal.student?.name}</span>
              </div>
              <div className="ticket-body">
                <p>{showResolveModal.description}</p>
                {showResolveModal.attachments?.length > 0 && (
                  <div className="modal-attachment">
                    <img src={showResolveModal.attachments[0]} alt="Doubt context" />
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleResolveSubmit} className="answer-section">
              <div className="section-header">
                <Send size={16} />
                <h4>Your Official Resolution</h4>
              </div>
              <textarea 
                required 
                placeholder="Provide a detailed explanation or step-by-step solution..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <button type="submit" className="btn-primary resolve-submit-btn" disabled={isLoading || !answer.trim()}>
                {isLoading ? 'Resolving Inquiry...' : 'Transmit Resolution'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubtDashboard;

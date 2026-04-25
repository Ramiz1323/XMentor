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
  ChevronRight,
  Trash2,
  Calendar,
  User as UserIcon,
  Image as ImageIcon
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useDoubtStore from '../../store/useDoubtStore';

const DoubtDashboard = () => {
  const { user } = useAuthStore();
  const { doubts, fetchDoubts, askDoubt, resolveDoubt, deleteDoubt, isLoading, error } = useDoubtStore();
  
  const [filter, setFilter] = useState({ status: '', subject: '' });
  const [showAskModal, setShowAskModal] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  
  // Ask Doubt Form State
  const [askData, setAskData] = useState({
    teacherId: '',
    title: '', 
    description: '',
    subject: '',
    priority: 'MEDIUM'
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Teacher Answer State
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
    } catch (err) {}
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    try {
      await resolveDoubt(selectedDoubt._id, answer);
      setSelectedDoubt(null);
      setAnswer('');
    } catch (err) {}
  };

  const handleDeleteDoubt = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to withdraw this inquiry?')) {
      await deleteDoubt(id);
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
              onClick={() => setSelectedDoubt(doubt)}
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
                  <div className="attachment-overlay"><ImageIcon size={14} /> View Reference</div>
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
                {!isTeacher && doubt.status === 'PENDING' && (
                  <button 
                    className="delete-btn-minimal" 
                    onClick={(e) => handleDeleteDoubt(e, doubt._id)}
                    title="Withdraw Inquiry"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
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
              <button 
                onClick={() => {
                  setShowAskModal(false);
                  setAskData({ teacherId: '', title: '', description: '', subject: '', priority: 'MEDIUM' });
                  setSelectedFile(null);
                }} 
                className="close-btn"
              >
                <X size={20} />
              </button>
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

      {/* Detail / Resolve Modal */}
      {selectedDoubt && (
        <div className="modal-overlay">
          <div className="glass-card resolve-modal full-detail-modal">
            <div className="modal-header">
              <div className="header-title-group">
                <HelpCircle className="header-icon" />
                <h2>Inquiry Details</h2>
              </div>
              <button onClick={() => setSelectedDoubt(null)} className="close-btn-ghost"><X size={20} /></button>
            </div>
            
            <div className="modal-body-scrollable">
              <div className="doubt-context-ticket">
                <div className="ticket-meta">
                  <span className="subject">{selectedDoubt.subject}</span>
                  <span className="divider">|</span>
                  <span className="chapter">{selectedDoubt.title}</span>
                  <span className="divider">|</span>
                  <span className="student">By {selectedDoubt.student?.name}</span>
                </div>
                <div className="ticket-body">
                  <p>{selectedDoubt.description}</p>
                  {selectedDoubt.attachments?.length > 0 && (
                    <div className="modal-attachment">
                      <a href={selectedDoubt.attachments[0]} target="_blank" rel="noreferrer">
                        <img src={selectedDoubt.attachments[0]} alt="Doubt context" />
                      </a>
                      <span className="img-hint">Click image to enlarge</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedDoubt.status === 'RESOLVED' ? (
                <div className="resolved-view-section">
                  <div className="section-header success">
                    <CheckCircle size={18} />
                    <h4>Official Resolution</h4>
                  </div>
                  <div className="resolution-bubble">
                    <p>{selectedDoubt.answer?.content}</p>
                    <div className="bubble-footer">
                      <UserIcon size={12} /> Resolved by {selectedDoubt.teacher?.name}
                      <span className="spacer">|</span>
                      <Calendar size={12} /> {new Date(selectedDoubt.answer?.answeredAt || selectedDoubt.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ) : isTeacher ? (
                <form onSubmit={handleResolveSubmit} className="answer-section">
                  <div className="section-header">
                    <Send size={16} />
                    <h4>Provide Official Resolution</h4>
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
              ) : (
                <div className="pending-status-msg">
                  <Clock size={20} />
                  <div>
                    <h4>Awaiting Mentor Review</h4>
                    <p>Your inquiry is in the queue. You will be notified once a mentor provides a resolution.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubtDashboard;

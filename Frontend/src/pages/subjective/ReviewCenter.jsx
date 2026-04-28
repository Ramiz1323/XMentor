import { useState, useEffect, Fragment } from 'react';
import useSubjectiveStore from '../../store/useSubjectiveStore';
import { CheckCircle2, User, BookOpen, Send, AlertCircle, Search, Target, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import MathRenderer from '../../components/ui/MathRenderer';

const ReviewCenter = () => {
  const { pendingSubmissions, fetchPendingSubmissions, gradeSubmission, isLoading } = useSubjectiveStore();
  const [gradingId, setGradingId] = useState(null);
  const [marks, setMarks] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPendingSubmissions();
  }, [fetchPendingSubmissions]);

  const handleGrade = async (id) => {
    const marksNum = parseInt(marks);
    if (isNaN(marksNum)) return alert("Please enter valid marks.");
    
    try {
      await gradeSubmission(id, marksNum);
      setGradingId(null);
      setMarks('');
      alert("Marks Authorized! Student's performance stats and leaderboard have been updated.");
    } catch (err) {
      alert(err.message || "Grading failed");
    }
  };

  const filteredSubmissions = pendingSubmissions.filter(s => {
    const studentName = s.studentId?.name || 'Unknown Student';
    const testTitle = s.testId?.title || 'Unknown Mission';
    return studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           testTitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading && pendingSubmissions.length === 0) return <LoadingOverlay />;

  return (
    <div className="task-results-container">
      <header>
        <h1 className="glow-text">Strategic Review Center</h1>
        <p className="subtitle">Evaluate physical copies and authorize academic scores.</p>
      </header>

      <div className="results-section mt-8">
        <div className="section-header">
          <h2 className="section-title">Pending Evaluations ({filteredSubmissions.length})</h2>
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              placeholder="Search student or task..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input"
            />
          </div>
        </div>

        <div className="results-table-wrapper">
          {filteredSubmissions.length === 0 ? (
            <div className="empty-state p-12 text-center">
              <CheckCircle2 size={48} className="mb-4 opacity-20" style={{ margin: '0 auto' }} />
              <p className="opacity-50">No pending evaluations. All missions cleared.</p>
            </div>
          ) : (
            <table className="strategic-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Mission Intel</th>
                  <th>Uplink Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub) => (
                  <Fragment key={sub._id}>
                    <tr className={gradingId === sub._id ? 'active-row' : ''}>
                        <td>
                        <div className="student-info">
                            <div className="avatar">
                            {sub.studentId?.profilePic ? (
                                <img src={sub.studentId.profilePic} alt="" />
                            ) : (
                                (sub.studentId?.name || 'U').charAt(0)
                            )}
                            </div>
                            <div>
                            <div className="name">{sub.studentId?.name || 'Unknown Student'}</div>
                            <div className="username">@{sub.studentId?.username || 'unknown'}</div>
                            </div>
                        </div>
                        </td>
                        <td>
                        <div className="mission-info">
                            <div className="name">{sub.testId?.title || 'Unknown Mission'}</div>
                            <span className="subject-tag">{sub.testId?.subject || 'General'}</span>
                        </div>
                        </td>
                        <td className="date-cell">
                        {new Date(sub.submissionDate).toLocaleString()}
                        </td>
                        <td>
                        <div className="action-cell">
                            <button 
                                className={`btn-primary ${gradingId === sub._id ? 'active' : ''}`} 
                                onClick={() => {
                                    if (gradingId === sub._id) {
                                        setGradingId(null);
                                    } else {
                                        setGradingId(sub._id);
                                        setMarks('');
                                    }
                                }}
                            >
                                {gradingId === sub._id ? 'Close Panel' : 'Enter Marks'}
                            </button>
                        </div>
                        </td>
                    </tr>
                    
                    {gradingId === sub._id && (
                        <tr>
                            <td colSpan="4">
                                <div className="mission-details-panel">
                                    <div className="panel-header">
                                        <Target size={16} /> QUESTION PAPER REFERENCE (MAX MARKS: {sub.maxMarks})
                                    </div>
                                    
                                    <div className="questions-reference-list">
                                        {sub.testId?.questions?.map((q, idx) => (
                                                <div key={idx} className="question-ref-item">
                                                  <div className="q-meta-small">
                                                      <span className="q-index">QUESTION #{idx + 1}</span>
                                                      <span className="q-marks">{q.marks} PTS</span>
                                                  </div>
                                                  <div className="q-text">
                                                      <MathRenderer text={q.text} />
                                                  </div>
                                                </div>
                                        )) || <p className="p-4 opacity-50">Reference intelligence unavailable for this mission.</p>}
                                    </div>
                                    
                                    <div className="grading-submission-zone">
                                        <div className="grading-container">
                                            <label>Authorize Final Score</label>
                                            <div className="grading-input-group">
                                                <div className="input-wrapper">
                                                    <input 
                                                        type="number" 
                                                        className="glass-input" 
                                                        placeholder="Score..."
                                                        value={marks}
                                                        onChange={(e) => setMarks(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <span className="score-suffix">/ {sub.maxMarks}</span>
                                                </div>
                                                <button className="btn-primary" onClick={() => handleGrade(sub._id)}>
                                                    <Send size={18} /> Authorize Marks
                                                </button>
                                                <button className="btn-sec" onClick={() => setGradingId(null)}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCenter;

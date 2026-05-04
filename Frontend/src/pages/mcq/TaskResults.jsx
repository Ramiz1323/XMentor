import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import useMCQStore from '../../store/useMCQStore';
import { Users, Target, Clock, ArrowLeft, Award, Calendar, Eye, UserX, Trash2, BookOpen, RotateCcw } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import SubmissionDetail from './SubmissionDetail';
import ExamReviewModal from './ExamReviewModal';

const TaskResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { analytics: data, fetchAnalytics, deleteTest, isLoading, error, reassignStudent } = useMCQStore();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showExamReview, setShowExamReview] = useState(false);

  const handleReassign = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to reassign this test to ${studentName}? This will delete their current score and allow them to retake the test.`)) {
      try {
        await reassignStudent(id, studentId);
      } catch (err) {
        alert('Reassignment failed: ' + err.message);
      }
    }
  };

  useEffect(() => {
    fetchAnalytics(id);
  }, [id, fetchAnalytics]);

  const handleDelete = async () => {
    if (window.confirm('CRITICAL: Are you sure you want to terminate this intelligence task? This action cannot be reversed.')) {
      try {
        await deleteTest(id);
        navigate('/mcq');
      } catch (err) {
        alert('Termination failed: ' + err.message);
      }
    }
  };

  const ResultsSkeleton = () => (
    <div className="task-results-container">
      <header>
        <Skeleton width="100px" height="20px" className="mb-4" />
        <div className="header-main">
          <div>
            <Skeleton width="300px" height="36px" className="mb-2" />
            <Skeleton width="200px" height="16px" />
          </div>
          <Skeleton width="100px" height="60px" />
        </div>
      </header>
      <div className="stats-grid">
        {[...Array(3)].map((_, i) => <Skeleton key={i} width="100%" height="100px" variant="rect" />)}
      </div>
      <div className="results-section">
        <div className="section-header">
          <Skeleton width="150px" height="24px" />
        </div>
        <div className="results-table-wrapper">
          {[...Array(5)].map((_, i) => <Skeleton key={i} width="100%" height="70px" className="mb-2" />)}
        </div>
      </div>
    </div>
  );

  if (isLoading || !data || (data.test && data.test._id !== id)) return <ResultsSkeleton />;

  if (error) {
    return (
      <div className="error-page">
        <h2 className="glow-text">Task Data Corrupted or Unauthorized</h2>
        <p className="error-description">{error || "We couldn't retrieve the intelligence data for this task."}</p>
        <Link to="/mcq" className="btn-primary mt-6">
          <ArrowLeft size={18} /> Back to Hub
        </Link>
      </div>
    );
  }

  const { test, results, pendingStudents, stats } = data;

  return (
    <div className="task-results-container">
      <header>
        <Link to="/mcq" className="back-link">
          <ArrowLeft size={16} /> Back to Hub
        </Link>
        <div className="header-main">
          <div className="title-section">
            <h1 className="compact-title">
              <span className="accent">{test.title}</span> 
              <span className="divider">/</span> 
              Analytics
            </h1>
            <div className="meta-row compact">
              <span className="meta-tag"><Calendar size={12} /> {new Date(test.createdAt).toLocaleDateString()}</span>
              {test.deadline && (
                <span className={`meta-tag ${new Date(test.deadline) < new Date() ? 'expired' : ''}`}>
                  <Clock size={12} /> {new Date(test.deadline).toLocaleDateString()}
                </span>
              )}
              <span className="meta-tag"><Target size={12} /> {test.totalQuestions}Q</span>
              <span className="meta-tag"><Clock size={12} /> {test.duration}m</span>
              
              <button className="btn-review-exam" onClick={() => setShowExamReview(true)}>
                <BookOpen size={12} /> Review Paper
              </button>

              <button className="delete-task-btn" onClick={handleDelete} title="Terminate Task">
                <Trash2 size={14} /> Terminate
              </button>
            </div>
          </div>
          <div className="avg-score-box compact">
             <div className="score">{stats.avgScore} <span className="small">/ {test.totalQuestions}</span></div>
             <div className="label">Cohort Average</div>
          </div>
        </div>
      </header>

      <div className="stats-grid">
         <div className="stat-card completion">
            <Users size={20} />
            <div className="info-wrap">
              <div className="value">{stats.totalAttempts} / {stats.totalAssigned}</div>
              <div className="label">Cohort Completion</div>
            </div>
         </div>
         <div className="stat-card perfect">
            <Award size={20} />
            <div className="info-wrap">
              <div className="value">{results.filter(r => r.score === test.totalQuestions).length}</div>
              <div className="label">Perfect Scores</div>
            </div>
         </div>
         <div className="stat-card time">
            <Clock size={20} />
            <div className="info-wrap">
              <div className="value">
                {results.length > 0 ? (results.reduce((acc, r) => acc + r.timeTaken, 0) / results.length / 60).toFixed(1) : 0}m
              </div>
              <div className="label">Avg Efficiency</div>
            </div>
         </div>
      </div>

      <div className="results-section">
        <div className="section-header">
          <h3>Completed Field Data</h3>
          <div className="line"></div>
        </div>

        <div className="results-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student Intelligence</th>
                <th>Performance Score</th>
                <th>Time Efficiency</th>
                <th>Sync Date</th>
                <th>Operation</th>
              </tr>
            </thead>
            <tbody>
              {(results || []).map((res) => (
                <tr key={res._id}>
                  <td className="student-info-cell" data-label="Student">
                    <div className="student-info">
                      <div className="avatar">
                        {res.studentId?.profilePic ? (
                          <img src={res.studentId.profilePic} alt="" />
                        ) : (
                          res.studentId?.name?.charAt(0) || '?'
                        )}
                      </div>
                      <div className="details">
                        <div className="name">{res.studentId?.name || 'Unknown Agent'}</div>
                        <div className="username">@{res.studentId?.username || 'unknown'}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Score">
                     <span className={`score-pill ${test.totalQuestions > 0 && res.score / test.totalQuestions >= 0.8 ? 'score-high' : test.totalQuestions > 0 && res.score / test.totalQuestions >= 0.5 ? 'score-mid' : 'score-low'}`}>
                       {res.score} / {test.totalQuestions}
                     </span>
                  </td>
                  <td data-label="Time">
                    <span className="efficiency-val">
                      {Math.floor(res.timeTaken / 60)}m {res.timeTaken % 60}s
                    </span>
                  </td>
                  <td className="date-cell" data-label="Sync Date">
                    {new Date(res.createdAt).toLocaleDateString()}
                  </td>
                  <td data-label="Action">
                    <div className="action-row">
                      <button 
                        className="btn-sec detail-btn"
                        onClick={() => setSelectedSubmission(res)}
                      >
                        <Eye size={14} /> Detail
                      </button>
                      <button 
                        className="btn-sec reassign-btn"
                        onClick={() => handleReassign(res.studentId._id, res.studentId.name)}
                      >
                        Reassign
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!results || results.length === 0) && (
                <tr>
                  <td colSpan="5" className="empty-table-cell">
                    No intelligence data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pendingStudents && pendingStudents.length > 0 && (
        <div className="results-section mt-8">
          <div className="section-header">
            <h3>Pending Recipients</h3>
            <div className="line"></div>
          </div>
          <div className="pending-grid">
            {pendingStudents.map(student => (
              <div key={student._id} className="pending-student-card">
                 <div className="avatar">
                    {student.profilePic ? <img src={student.profilePic} alt="" /> : (student.name?.charAt(0) || '?')}
                 </div>
                 <div className="info">
                    <div className="name">{student.name}</div>
                    <div className="username">@{student.username}</div>
                 </div>
                 <div className="status"><Clock size={12} /> Pending</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSubmission && (
        <SubmissionDetail 
          test={test}
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}

      {showExamReview && (
        <ExamReviewModal 
          test={test}
          results={results}
          onClose={() => setShowExamReview(false)}
        />
      )}
    </div>
  );
};

export default TaskResults;

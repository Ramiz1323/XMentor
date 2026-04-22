import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useMCQStore from '../../store/useMCQStore';
import { Users, Target, Clock, ArrowLeft, Award, Calendar } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';

const TaskResults = () => {
  const { id } = useParams();
  const { analytics: data, fetchAnalytics, isLoading, error } = useMCQStore();

  useEffect(() => {
    fetchAnalytics(id);
  }, [id, fetchAnalytics]);

  const ResultsSkeleton = () => (
    <div className="task-results-container">
      <header>
        <Skeleton width="100px" height="20px" className="mb-4" />
        <div className="header-main" style={{ marginBottom: '2rem' }}>
          <div style={{ flex: 1 }}>
            <Skeleton width="300px" height="36px" className="mb-2" />
            <Skeleton width="200px" height="16px" />
          </div>
          <Skeleton width="100px" height="60px" />
        </div>
      </header>
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[...Array(3)].map((_, i) => <Skeleton key={i} width="100%" height="100px" variant="rect" />)}
      </div>
      <div className="results-section">
        <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton width="150px" height="24px" />
        </div>
        <div className="results-table-wrapper">
          {[...Array(5)].map((_, i) => <Skeleton key={i} width="100%" height="70px" style={{ marginBottom: '8px' }} />)}
        </div>
      </div>
    </div>
  );

  if (isLoading && !data) return <ResultsSkeleton />;

  if (error || !data) {
    return (
      <div className="error-page" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <h2 className="glow-text">Task Data Corrupted or Unauthorized</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '1rem' }}>{error || "We couldn't retrieve the intelligence data for this task."}</p>
        <Link to="/mcq" className="btn-primary mt-6" style={{ display: 'inline-flex', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Back to Hub
        </Link>
      </div>
    );
  }

  const { test, results, stats } = data;

  return (
    <div className="task-results-container">
      <header>
        <Link to="/mcq" className="back-link">
          <ArrowLeft size={16} /> Back to Hub
        </Link>
        <div className="header-main">
          <div>
            <h1 className="glow-text">{test.title} | Performance Intelligence</h1>
            <div className="meta-row">
              <span className="meta-tag"><Calendar size={14} /> Created {new Date(test.createdAt).toLocaleDateString()}</span>
              <span className="meta-tag"><Target size={14} /> {test.totalQuestions} Questions</span>
              <span className="meta-tag"><Clock size={14} /> {test.duration}m Limit</span>
            </div>
          </div>
          <div className="avg-score-box">
             <div className="score">{stats.avgScore} / {test.totalQuestions}</div>
             <div className="label">Avg Cohort Score</div>
          </div>
        </div>
      </header>

      <div className="stats-grid">
         <div className="stat-card completion">
            <Users size={24} />
            <div className="value">{stats.totalAttempts}</div>
            <div className="label">Total Completions</div>
         </div>
         <div className="stat-card perfect">
            <Award size={24} />
            <div className="value">{results.filter(r => r.score === test.totalQuestions).length}</div>
            <div className="label">Perfect Scores</div>
         </div>
         <div className="stat-card time">
            <Clock size={24} />
            <div className="value">
              {results.length > 0 ? (results.reduce((acc, r) => acc + r.timeTaken, 0) / results.length / 60).toFixed(1) : 0}m
            </div>
            <div className="label">Avg Completion Time</div>
         </div>
      </div>

      <div className="results-section">
        <div className="section-header">
          <h3>Recipient Field Data</h3>
        </div>

        <div className="results-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
                <th>Efficiency</th>
                <th>Submission</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(results || []).map((res) => (
                <tr key={res._id}>
                  <td>
                    <div className="student-info">
                      <div className="avatar">
                        {res.studentId?.profilePic ? (
                          <img src={res.studentId.profilePic} alt="" />
                        ) : (
                          res.studentId?.name?.charAt(0) || '?'
                        )}
                      </div>
                      <div>
                        <div className="name">{res.studentId?.name || 'Unknown Participant'}</div>
                        <div className="username">@{res.studentId?.username || 'unknown'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                     <span className={`score-pill ${test.totalQuestions > 0 && res.score / test.totalQuestions >= 0.8 ? 'score-high' : test.totalQuestions > 0 && res.score / test.totalQuestions >= 0.5 ? 'score-mid' : 'score-low'}`}>
                       {res.score} / {test.totalQuestions}
                     </span>
                  </td>
                  <td>
                    {Math.floor(res.timeTaken / 60)}m {res.timeTaken % 60}s
                  </td>
                  <td className="date-cell">
                    {new Date(res.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span className="status-pill">Completed</span>
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
    </div>
  );
};

export default TaskResults;

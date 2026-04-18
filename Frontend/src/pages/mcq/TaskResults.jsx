import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import { Users, Target, Clock, ArrowLeft, Search, GraduationCap, Award, Calendar } from 'lucide-react';

const TaskResults = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data: res } = await api.get(`/mcq/${id}/analytics`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  if (loading) return <div className="loader">Decoding Task Intelligence...</div>;
  if (!data) return <div className="error-page">Task data corrupted or unauthorized.</div>;

  const { test, results, stats } = data;

  const filteredResults = results.filter(r => 
    r.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.studentId?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="task-results-container">
      <header>
        <Link to="/mcq-hub" className="back-link">
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
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input 
              className="glass-input"
              placeholder="Filter by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
              {filteredResults.map((res) => (
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
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-table-cell">
                    No intelligence data matched your filter criteria.
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

import { useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useUserStore from '../../store/useUserStore';
import useMCQStore from '../../store/useMCQStore';
import { BookOpen, Users, Trophy, MessageSquare, Target, CheckCircle, Clock, ArrowRight, AlertCircle, Shield, User, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Skeleton from '../../components/ui/Skeleton';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import SEO from '../../components/common/SEO';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { stats, fetchStats, isLoading } = useUserStore();
  const { tests, fetchMyTests, isLoading: testsLoading } = useMCQStore();
  const [viewMode, setViewMode] = useState('STUDENT');

  useEffect(() => {
    fetchStats();
    if (user?.role === 'STUDENT') {
      fetchMyTests();
    }
  }, [fetchStats, fetchMyTests, user?.role]);

  const pendingTests = (Array.isArray(tests) ? tests : []).filter(t => !t.isSubmitted).slice(0, 3);
  const completedTests = (Array.isArray(tests) ? tests : []).filter(t => t.isSubmitted).slice(0, 5);

  if (isLoading && !stats?.mcq) return <LoadingOverlay />;

  return (
    <div className="dashboard-container">
      <SEO 
        title="Strategic Dashboard" 
        description="Manage your learning path, track assessment scores, and collaborate with your mentors in the XMentor tactical hub." 
      />
      <header className="dashboard-header">
        <div className="welcome-text">
          {viewMode === 'STUDENT' ? (
            <>
              <h1 className="glow-text">Strategic Overview, {user?.name}</h1>
              <p>Analyzing your tactical progress across the XMentor network.</p>
            </>
          ) : (
            <>
              <h1 className="glow-text parent-glow">Parental Monitoring System</h1>
              <p>Oversight activated for cadet: <span className="highlight-name">{user?.name}</span></p>
            </>
          )}
        </div>
        
        <div className="header-actions">
          {user?.role === 'STUDENT' && (
            <div className="view-mode-toggle glass-card">
              <button 
                className={`toggle-btn ${viewMode === 'STUDENT' ? 'active' : ''}`}
                onClick={() => setViewMode('STUDENT')}
              >
                <User size={16} /> Cadet
              </button>
              <button 
                className={`toggle-btn parent-btn ${viewMode === 'PARENT' ? 'active' : ''}`}
                onClick={() => setViewMode('PARENT')}
              >
                <Shield size={16} /> Parent
              </button>
            </div>
          )}
          <Link to="/leaderboard" className="user-badge glass-card clickable-badge">
            <Trophy size={20} className="gold-icon" />
            <span>Leaderboard</span>
          </Link>
        </div>
      </header>

      {user?.role === 'STUDENT' && viewMode === 'STUDENT' && (pendingTests.length > 0 || testsLoading) && (
        <section className="pending-tasks-section top-priority">
          <h2 className="section-title">
            <Clock size={18} />
            <span>Pending Operations</span>
          </h2>
          <div className="pending-grid">
            {testsLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="pending-task-card glass-card skeleton-card">
                  <div className="task-info">
                    <Skeleton width="60px" height="12px" className="mb-2" />
                    <Skeleton width="180px" height="24px" />
                  </div>
                </div>
              ))
            ) : (
              pendingTests.map(test => (
                <Link key={test._id} to={`/mcq/${test._id}`} className="pending-task-card glass-card">
                  <div className="task-info">
                    <div className="task-type-tag">{test.subject}</div>
                    <h3>{test.title}</h3>
                    {test.deadline && !isNaN(new Date(test.deadline).getTime()) && (
                      <div className="deadline-alert">
                        <AlertCircle size={12} />
                        <span>Ends: {new Date(test.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    )}
                  </div>
                  <div className="action-button">
                    <ArrowRight size={20} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      )}

      {viewMode === 'STUDENT' && (
      <div className="stats-grid">
        {/* Community Stats */}
        <div className="stat-card glass-card">
          <div className="stat-header">
            <div className="icon-box blue">
              <Users size={24} />
            </div>
            <span className="stat-label">Network Connectivity</span>
          </div>
          <div className="stat-value">
            {isLoading ? <Skeleton width="50px" height="32px" /> : stats?.communities?.joinedCommunities || 0}
          </div>
          <p className="stat-desc">Active Communities Joined</p>
        </div>

        {/* MCQ Stats */}
        <div className="stat-card glass-card">
          <div className="stat-header">
            <div className="icon-box cyan">
              <Target size={24} />
            </div>
            <span className="stat-label">Cognitive Accuracy</span>
          </div>
          <div className="stat-value">
            {isLoading ? <Skeleton width="50px" height="32px" /> : `${stats?.mcq?.avgScore || 0}%`}
          </div>
          <p className="stat-desc">{stats?.mcq?.totalTests || 0} Assessments Completed</p>
          {stats?.mcq?.totalTests > 0 && (
            <div className="stat-progress-bar">
              <div className="progress" style={{ width: `${stats.mcq.avgScore}%` }}></div>
            </div>
          )}
        </div>

        {/* Doubt Stats */}
        <div className="stat-card glass-card">
          <div className="stat-header">
            <div className="icon-box purple">
              <HelpCircle size={24} />
            </div>
            <span className="stat-label">Inquiry Resolution</span>
          </div>
          <div className="stat-value">
            {isLoading ? <Skeleton width="50px" height="32px" /> : stats?.doubts?.resolvedDoubts || 0}
          </div>
          <p className="stat-desc">Doubts Resolved / {stats?.doubts?.totalDoubts || 0} Total</p>
        </div>
      </div>
      )}

      {viewMode === 'STUDENT' && (
        <div className="dashboard-main-content">
        <section className="quick-access">
          <h2 className="section-title">Tactical Operations</h2>
          <div className="actions-grid">
            <Link to="/communities" className="action-card glass-card">
              <div className="action-icon">
                <Users size={24} />
              </div>
              <div className="action-info">
                <h4>Anonymous Hubs</h4>
                <p>Deploy to collaborative encrypted channels.</p>
              </div>
              <ChevronRight size={20} className="arrow" />
            </Link>

            <Link to="/mcq" className="action-card glass-card">
              <div className="action-icon">
                <BookOpen size={24} />
              </div>
              <div className="action-info">
                <h4>Training Grounds</h4>
                <p>Initiate MCQ assessments and knowledge audits.</p>
              </div>
              <ChevronRight size={20} className="arrow" />
            </Link>

            <Link to="/doubts" className="action-card glass-card">
              <div className="action-icon">
                <MessageSquare size={24} />
              </div>
              <div className="action-info">
                <h4>Doubt Uplink</h4>
                <p>Transmit inquiries to assigned senior mentors.</p>
              </div>
              <ChevronRight size={20} className="arrow" />
            </Link>
          </div>
        </section>
      </div>
      )}

      {viewMode === 'PARENT' && (
        <div className="parent-monitoring-content">
          <div className="parent-stats-grid">
            <div className="p-stat-card glass-card">
              <span className="p-stat-label">Cognitive Accuracy</span>
              <div className="p-stat-value">{isLoading ? <Skeleton width="50px" height="32px" /> : `${stats?.mcq?.avgScore || 0}%`}</div>
            </div>
            <div className="p-stat-card glass-card">
              <span className="p-stat-label">Assessments Completed</span>
              <div className="p-stat-value">{isLoading ? <Skeleton width="50px" height="32px" /> : stats?.mcq?.totalTests || 0}</div>
            </div>
            <div className="p-stat-card glass-card">
              <span className="p-stat-label">Questions Solved</span>
              <div className="p-stat-value">{isLoading ? <Skeleton width="50px" height="32px" /> : stats?.mcq?.totalQuestionsSolved || 0}</div>
            </div>
            <div className="p-stat-card glass-card alert-card">
              <span className="p-stat-label">Late Submissions</span>
              <div className={`p-stat-value ${(stats?.mcq?.lateSubmissions || 0) > 0 ? 'text-danger' : 'text-success'}`}>
                {isLoading ? <Skeleton width="50px" height="32px" /> : stats?.mcq?.lateSubmissions || 0}
              </div>
            </div>
          </div>

          <section className="pending-assessments mt-4">
            <h2 className="section-title">
              <Clock size={18} />
              <span>Pending Assessments</span>
            </h2>
            <div className="assessments-list glass-card">
              {testsLoading ? (
                 <div className="p-4"><Skeleton width="100%" height="40px" /></div>
              ) : pendingTests.length > 0 ? (
                pendingTests.map(test => (
                  <div key={test._id} className="assessment-row pending-row">
                    <div className="assessment-details">
                      <span className="subject-tag">{test.subject}</span>
                      <h4>{test.title}</h4>
                      <span className="date-taken alert-text">
                        Ends: {test.deadline ? new Date(test.deadline).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No deadline'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-alert">
                  <CheckCircle size={24} className="text-success mb-2" />
                  <p>All assessments completed! No pending tasks.</p>
                </div>
              )}
            </div>
          </section>

          <section className="recent-assessments mt-4">
            <h2 className="section-title">
              <Activity size={18} />
              <span>Recent Assessment Logs</span>
            </h2>
            <div className="assessments-list glass-card">
              {testsLoading ? (
                 <div className="p-4"><Skeleton width="100%" height="40px" /></div>
              ) : completedTests.length > 0 ? (
                completedTests.map(test => (
                  <div key={test._id} className="assessment-row">
                    <div className="assessment-details">
                      <span className="subject-tag">{test.subject}</span>
                      <h4>{test.title}</h4>
                      <span className="date-taken">
                        {test.submittedAt ? new Date(test.submittedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Completed'}
                      </span>
                    </div>
                    <div className="assessment-score">
                      <div className="score-ring">
                        <span className="score-value">{Math.round((test.score / test.totalScore) * 100) || 0}%</span>
                      </div>
                      <div className="score-fraction">{test.score} / {test.totalScore}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-alert">
                  <CheckCircle size={24} className="text-muted mb-2" />
                  <p>No completed assessments recorded yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

// Simple HelpCircle and ChevronRight icons as they might not be imported
const HelpCircle = ({ size, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ChevronRight = ({ size, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    {...props}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default Dashboard;

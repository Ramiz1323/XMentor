import { useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useUserStore from '../../store/useUserStore';
import useMCQStore from '../../store/useMCQStore';
import { BookOpen, Users, Trophy, MessageSquare, Target, CheckCircle, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Skeleton from '../../components/ui/Skeleton';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import SEO from '../../components/common/SEO';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { stats, fetchStats, isLoading } = useUserStore();
  const { tests, fetchMyTests, isLoading: testsLoading } = useMCQStore();

  useEffect(() => {
    fetchStats();
    if (user?.role === 'STUDENT') {
      fetchMyTests();
    }
  }, [fetchStats, fetchMyTests, user?.role]);

  const pendingTests = (tests || []).filter(t => !t.isSubmitted).slice(0, 3);

  if (isLoading && !stats?.mcq) return <LoadingOverlay />;

  return (
    <div className="dashboard-container">
      <SEO 
        title="Strategic Dashboard" 
        description="Manage your learning path, track assessment scores, and collaborate with your mentors in the XMentor tactical hub." 
      />
      <header className="dashboard-header">
        <div className="welcome-text">
          <h1 className="glow-text">Strategic Overview, {user?.name}</h1>
          <p>Analyzing your tactical progress across the XMentor network.</p>
        </div>
        <Link to="/leaderboard" className="user-badge glass-card clickable-badge">
          <Trophy size={20} className="gold-icon" />
          <span>Leaderboard</span>
        </Link>
      </header>

      {user?.role === 'STUDENT' && (pendingTests.length > 0 || testsLoading) && (
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

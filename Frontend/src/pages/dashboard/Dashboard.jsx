import { useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useUserStore from '../../store/useUserStore';
import { BookOpen, Users, Trophy, MessageSquare, Target, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Skeleton from '../../components/ui/Skeleton';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { stats, fetchStats, isLoading } = useUserStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="dashboard-container">
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

        {/* Recent Performance can be added here if needed */}
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
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
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
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default Dashboard;

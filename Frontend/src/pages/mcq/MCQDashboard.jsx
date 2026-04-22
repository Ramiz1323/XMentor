import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useMCQStore from '../../store/useMCQStore';
import { Plus, BookOpen, Clock, Target, Users } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';

const MCQDashboard = () => {
  const { user } = useAuthStore();
  const { tests, fetchMyTests, isLoading, error } = useMCQStore();

  useEffect(() => {
    fetchMyTests();
  }, [fetchMyTests]);

  const TaskCard = ({ test }) => (
    <div className={`glass-card task-card ${test.createdBy?._id === user._id ? 'owned' : ''}`}>
      <div className="card-header">
        <div className="title-group">
          <span className="subject-tag">{test.subject}</span>
          <h3>{test.title}</h3>
        </div>
        <div className="duration-box">
           <p className="label">Duration</p>
           <p className="value">{test.duration}m</p>
        </div>
      </div>

      <div className="card-meta">
        <div className="meta-item">
          <BookOpen size={14} />
          {test.totalQuestions} Questions
        </div>
        <div className="meta-item">
          <Clock size={14} />
          {test.hasTimer ? 'Timed' : 'Fluid'}
        </div>
      </div>

      <div className="card-footer">
        <div className="creator-badge">
          <div className="avatar">
             {test.createdBy?.profilePic ? (
               <img src={test.createdBy.profilePic} alt="" />
             ) : (
               test.createdBy?.name?.charAt(0)
             )}
          </div>
          <span className="name">Mentor: {test.createdBy?.name}</span>
        </div>
        
        <div className="btn-row">
          {user.role === 'TEACHER' && test.createdBy?._id === user._id && (
            <Link 
              to={`/mcq/${test._id}/results`} 
              className="btn-sec results-btn" 
            >
              <Users size={14} /> Results
            </Link>
          )}
          <Link 
            to={`/mcq/${test._id}`} 
            className="btn-primary" 
          >
            {user.role === 'TEACHER' ? 'Participate' : 'Attend Task'}
          </Link>
        </div>
      </div>

      {test.createdBy?._id === user._id && (
        <div className="owner-indicator" />
      )}
    </div>
  );

  const TaskCardSkeleton = () => (
    <div className="glass-card task-card skeleton-card">
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div className="title-group">
          <Skeleton width="60px" height="18px" className="mb-2" />
          <Skeleton width="180px" height="24px" />
        </div>
        <Skeleton width="50px" height="50px" variant="circle" />
      </div>
      <div className="card-meta" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Skeleton width="100px" height="16px" />
        <Skeleton width="100px" height="16px" />
      </div>
      <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Skeleton width="32px" height="32px" variant="circle" />
          <Skeleton width="100px" height="14px" />
        </div>
        <Skeleton width="120px" height="40px" />
      </div>
    </div>
  );

  return (
    <div className="mcq-dashboard-container">
      <header>
        <div className="header-info">
          <h1 className="glow-text">MCQ Task Hub</h1>
          <p className="subtitle">{user.role === 'TEACHER' ? 'Oversee assignments and student performance' : 'Access your designated training tasks'}</p>
        </div>
        {user.role === 'TEACHER' && (
          <Link to="/mcq/create" className="btn-primary">
            <Plus size={20} /> Create Task
          </Link>
        )}
      </header>

      <div className="hub-grid">
        {isLoading ? (
          [...Array(6)].map((_, i) => <TaskCardSkeleton key={i} />)
        ) : error ? (
          <div className="error-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
            <p className="error-text" style={{ color: '#ef4444', marginBottom: '1.5rem' }}>{error}</p>
            <button onClick={fetchMyTests} className="btn-primary">Retry Sync</button>
          </div>
        ) : tests.length > 0 ? (
          tests.map(test => <TaskCard key={test._id} test={test} />)
        ) : (
          <div className="empty-state">
            <Target size={48} className="empty-icon" />
            <h3>No tasks currently detected in your sector.</h3>
            {user.role === 'TEACHER' && <p>Start by creating a new curriculum task above.</p>}
          </div>
        )}
      </div>

      {user.role === 'TEACHER' && (!user.students || user.students.length === 0) && (
        <div className="cohort-alert">
           <Users size={32} />
           <div className="alert-content">
              <h4>Student Cohort Empty</h4>
              <p>You haven't recruited any students yet. Head to your <strong>Profile</strong> to add students by their unique username before assigning tasks.</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default MCQDashboard;

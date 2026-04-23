import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useMCQStore from '../../store/useMCQStore';
import { Plus, BookOpen, Clock, Target, Users } from 'lucide-react';
import TaskSkeleton from '../../components/skeletons/TaskSkeleton';

const MCQDashboard = () => {
  const { user } = useAuthStore();
  const { tests, fetchMyTests, isLoading, error } = useMCQStore();

  useEffect(() => {
    fetchMyTests();
  }, [fetchMyTests]);

  const TaskCard = ({ test }) => {
    const isCompleted = test.isSubmitted;

    return (
      <div className={`glass-card task-card ${test.createdBy?._id === user._id ? 'owned' : ''} ${isCompleted ? 'completed-task' : ''}`}>
        <div className="card-header">
          <div className="title-group">
            <div className="top-row">
               <span className="subject-tag">{test.subject}</span>
               {isCompleted && (
                 <span className="completed-badge">
                   <Target size={10} /> Finished
                 </span>
               )}
            </div>
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
                title="View Results"
              >
                <Users size={16} />
              </Link>
            )}
            
            {isCompleted ? (
              <Link 
                to={`/mcq/${test._id}`} 
                className="btn-sec review-btn"
              >
                 <BookOpen size={16} /> Review
              </Link>
            ) : (
              <Link 
                to={`/mcq/${test._id}`} 
                className="btn-primary" 
              >
                {user.role === 'TEACHER' ? 'Participate' : 'Attend'}
              </Link>
            )}
          </div>
        </div>

        {test.createdBy?._id === user._id && (
          <div className="owner-indicator" />
        )}
      </div>
    );
  };

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
          [...Array(6)].map((_, i) => <TaskSkeleton key={i} />)
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

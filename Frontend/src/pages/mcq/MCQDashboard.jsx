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
            <div className="top-row" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
               <span className="subject-tag">{test.subject}</span>
               {test.language && (
                 <span className="subject-tag" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                   {test.language}
                 </span>
               )}
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

        <div className="card-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1rem' }}>
          <div className="meta-item">
            <BookOpen size={14} />
            <span style={{ whiteSpace: 'nowrap' }}>{test.totalQuestions} Questions</span>
          </div>
          <div className="meta-item">
            <Clock size={14} />
            <span>{test.hasTimer ? 'Timed' : 'Fluid'}</span>
          </div>
          {test.deadline && (
            <div className="meta-item deadline-meta" style={{ color: new Date(test.deadline) < new Date() ? '#ef4444' : 'inherit', gridColumn: 'span 2' }}>
              <Clock size={14} />
              <span>Deadline: {new Date(test.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          )}
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

  const pendingTests = tests.filter(t => !t.isSubmitted);
  const completedTests = tests.filter(t => t.isSubmitted);

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

      <div className="dashboard-sections" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '2rem' }}>
        {/* PENDING SECTION */}
        <section className="dashboard-section">
          <div className="section-header" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            paddingBottom: '1rem',
            marginBottom: '2rem'
          }}>
            <h2 className="section-title" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              fontSize: '1.25rem',
              color: '#38bdf8',
              textTransform: 'uppercase',
              letterSpacing: '0.1rem',
              margin: 0
            }}>
               <Clock size={22} /> 
               <span>Pending Missions</span>
               <span className="count-badge" style={{
                 background: 'rgba(56, 189, 248, 0.1)',
                 color: '#38bdf8',
                 padding: '2px 12px',
                 borderRadius: '20px',
                 fontSize: '0.85rem',
                 border: '1px solid rgba(56, 189, 248, 0.2)'
               }}>{pendingTests.length}</span>
            </h2>
          </div>
          
          {pendingTests.length > 0 ? (
            <div className="hub-grid">
              {isLoading ? (
                [...Array(3)].map((_, i) => <TaskSkeleton key={i} />)
              ) : (
                pendingTests.map(test => <TaskCard key={test._id} test={test} />)
              )}
            </div>
          ) : !isLoading && (
            <div className="empty-section-msg" style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: '12px',
              border: '1px dashed rgba(255,255,255,0.1)',
              opacity: 0.6
            }}>
              <p>No pending tasks. Sector clear.</p>
            </div>
          )}
        </section>

        {/* COMPLETED SECTION */}
        {completedTests.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              paddingBottom: '1rem',
              marginBottom: '2rem'
            }}>
              <h2 className="section-title completed" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                fontSize: '1.25rem',
                color: '#10b981',
                textTransform: 'uppercase',
                letterSpacing: '0.1rem',
                margin: 0
              }}>
                 <Target size={22} /> 
                 <span>Completed Training</span>
                 <span className="count-badge" style={{
                   background: 'rgba(16, 185, 129, 0.1)',
                   color: '#10b981',
                   padding: '2px 12px',
                   borderRadius: '20px',
                   fontSize: '0.85rem',
                   border: '1px solid rgba(16, 185, 129, 0.2)'
                 }}>{completedTests.length}</span>
              </h2>
            </div>
            <div className="hub-grid">
              {completedTests.map(test => <TaskCard key={test._id} test={test} />)}
            </div>
          </section>
        )}
        
        {error && (
          <div className="error-state" style={{ textAlign: 'center', padding: '4rem' }}>
            <p className="error-text" style={{ color: '#ef4444', marginBottom: '1.5rem' }}>{error}</p>
            <button onClick={fetchMyTests} className="btn-primary">Retry Sync</button>
          </div>
        )}

        {!isLoading && tests.length === 0 && (
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

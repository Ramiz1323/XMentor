import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useMCQStore from '../../store/useMCQStore';
import { Plus, BookOpen, Clock, Target, Users, TrendingUp, Star, CheckCircle } from 'lucide-react';
import TaskSkeleton from '../../components/skeletons/TaskSkeleton';

const MCQDashboard = () => {
  const { user } = useAuthStore();
  const { tests, fetchMyTests, fetchTeacherOverview, isLoading, error } = useMCQStore();
  const [viewMode, setViewMode] = useState('TASK_WISE');
  const [overviewData, setOverviewData] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  useEffect(() => {
    fetchMyTests();
    if (user.role === 'TEACHER') {
      fetchTeacherOverview().then(data => setOverviewData(data));
    }
  }, [fetchMyTests, fetchTeacherOverview, user.role]);

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

  const StudentWiseView = ({ data }) => {
    if (!data || !data.studentStats) return <div className="loading-msg">Loading strategic cohort intelligence...</div>;

    return (
      <div className="student-wise-view">
        {data.studentStats.length === 0 ? (
          <div className="empty-section-msg">No students detected in your cohort.</div>
        ) : (
          data.studentStats.map(({ student, completedCount, pendingCount, pendingTasks, results }) => (
            <div key={student._id} className="student-container">
              <div 
                className={`glass-card student-card ${expandedStudentId === student._id ? 'expanded' : ''}`} 
                onClick={() => setExpandedStudentId(expandedStudentId === student._id ? null : student._id)}
              >
                <div className="student-profile">
                  <div className="avatar">
                    {student.profilePic ? <img src={student.profilePic} alt="" /> : student.name.charAt(0)}
                  </div>
                  <div className="info">
                    <div className="name">{student.name}</div>
                    <div className="username">@{student.username}</div>
                  </div>
                </div>

                <div className="spacer" />

                <div className="stats">
                  <div className="stat-item">
                    <div className="label">Completed</div>
                    <div className="value completed">{completedCount}</div>
                  </div>
                  <div className="stat-item">
                    <div className="label">Pending</div>
                    <div className="value pending">{pendingCount}</div>
                  </div>
                </div>

                <div className="expand-icon">
                   <BookOpen size={18} className={expandedStudentId === student._id ? 'expanded' : ''} />
                </div>
              </div>

              {expandedStudentId === student._id && (
                <div className="expanded-details">
                  <div className="detail-col">
                    <h4 className="pending-title">
                       <Clock size={14} /> Pending Assignments ({pendingTasks.length})
                    </h4>
                    <div className="task-list">
                      {pendingTasks.map(task => (
                        <div key={task._id} className="task-item pending">
                          <div className="task-info">
                            <div className="title">{task.title}</div>
                            <div className="subject">{task.subject}</div>
                          </div>
                        </div>
                      ))}
                      {pendingTasks.length === 0 && <div className="empty-msg">All assigned tasks completed!</div>}
                    </div>
                  </div>

                  <div className="detail-col">
                    <h4 className="completed-title">
                       <Target size={14} /> Completed Missions ({results.length})
                    </h4>
                    <div className="task-list">
                      {results.map(res => (
                        <div key={res._id} className="task-item completed">
                          <div className="task-info">
                            <div className="title">{res.testTitle}</div>
                            <div className="subject">{res.subject}</div>
                          </div>
                          <div className="score">{res.score}/{res.total}</div>
                        </div>
                      ))}
                      {results.length === 0 && <div className="empty-msg">No missions completed yet.</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  const StudentAnalytics = ({ tests }) => {
    const completed = tests.filter(t => t.isSubmitted);
    if (completed.length === 0) return null;

    // Calculate metrics
    const totalScore = completed.reduce((acc, t) => acc + (t.result?.score || 0), 0);
    const totalPossible = completed.reduce((acc, t) => acc + (t.result?.total || 0), 0);
    const avgAccuracy = Math.round((totalScore / totalPossible) * 100);

    const subjectStats = completed.reduce((acc, t) => {
      const sub = t.subject || 'OTHERS';
      if (!acc[sub]) acc[sub] = { score: 0, total: 0, count: 0 };
      acc[sub].score += t.result?.score || 0;
      acc[sub].total += t.result?.total || 0;
      acc[sub].count += 1;
      return acc;
    }, {});

    const sortedSubjects = Object.entries(subjectStats)
      .map(([name, data]) => ({
        name,
        accuracy: Math.round((data.score / data.total) * 100),
        count: data.count
      }))
      .sort((a, b) => b.accuracy - a.accuracy);

    return (
      <section className="analytics-hub">
        <div className="section-header">
          <h2 className="section-title analytics-title">
            <TrendingUp size={24} className="trend-icon" /> 
            <span className="glow-title">Performance Intelligence</span>
          </h2>
        </div>

        <div className="analytics-grid">
          {/* Radial Accuracy Chart */}
          <div className="glass-card chart-card radial-section">
            <div className="chart-content">
              <svg viewBox="0 0 100 100" className="radial-chart">
                <circle className="bg" cx="50" cy="50" r="45" />
                <circle 
                  className="meter" 
                  cx="50" cy="50" r="45" 
                  style={{ strokeDasharray: `${avgAccuracy * 2.82}, 282` }}
                />
                <text x="50" y="50" className="chart-value">{avgAccuracy}%</text>
                <text x="50" y="65" className="chart-label">ACCURACY</text>
              </svg>
            </div>
            <div className="chart-info">
              <div className="stat-row">
                <div className="dot completed" />
                <span>{completed.length} Missions Completed</span>
              </div>
              <div className="stat-row">
                <div className="dot pending" />
                <span>{tests.length - completed.length} Active Targets</span>
              </div>
            </div>
          </div>

          {/* Subject-wise Bar Chart */}
          <div className="glass-card chart-card subject-section">
            <h4 className="card-title">Subject Proficiency</h4>
            <div className="bar-list">
              {sortedSubjects.map(sub => (
                <div key={sub.name} className="bar-item">
                  <div className="bar-header">
                    <span className="name">{sub.name}</span>
                    <span className="val">{sub.accuracy}%</span>
                  </div>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: `${sub.accuracy}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rapid Stats */}
          <div className="rapid-stats">
            <div className="glass-card mini-stat">
              <Star className="icon" size={20} />
              <div className="val">{totalScore}</div>
              <div className="lab">Correct Solves</div>
            </div>
            <div className="glass-card mini-stat">
              <Clock className="icon" size={20} />
              <div className="val">{Math.round(completed.reduce((a, t) => a + (t.result?.timeTaken || 0), 0) / 60)}m</div>
              <div className="lab">Tactical Time</div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="mcq-dashboard-container">
      <header>
        <div className="header-info">
          <h1 className="glow-text">MCQ Task Hub</h1>
          <p className="subtitle">{user.role === 'TEACHER' ? 'Oversee assignments and student performance' : 'Access your designated training tasks'}</p>
        </div>
        
        <div className="header-actions">
          {user.role === 'TEACHER' && (
            <div className="view-toggle">
              <button 
                onClick={() => setViewMode('TASK_WISE')}
                className={viewMode === 'TASK_WISE' ? 'active' : ''}
              >
                Task View
              </button>
              <button 
                onClick={() => setViewMode('STUDENT_WISE')}
                className={viewMode === 'STUDENT_WISE' ? 'active' : ''}
              >
                Student View
              </button>
            </div>
          )}
          {user.role === 'TEACHER' && (
            <Link to="/mcq/create" className="btn-primary">
              <Plus size={20} /> Create Task
            </Link>
          )}
        </div>
      </header>

      <div className="dashboard-sections">
        {user.role === 'STUDENT' && <StudentAnalytics tests={tests} />}
        
        {user.role === 'TEACHER' && viewMode === 'STUDENT_WISE' && (
          <StudentWiseView data={overviewData} />
        )}

        {viewMode === 'TASK_WISE' && (
          <>
            <section className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">
                   <Clock size={22} /> 
                   <span>Pending Missions</span>
                   <span className="count-badge">{pendingTests.length}</span>
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
                <div className="empty-section-msg">
                  <p>No pending tasks. Sector clear.</p>
                </div>
              )}
            </section>

            {completedTests.length > 0 && (
              <section className="dashboard-section">
                <div className="section-header">
                  <h2 className="section-title completed">
                     <Target size={22} /> 
                     <span>Completed Training</span>
                     <span className="count-badge">{completedTests.length}</span>
                  </h2>
                </div>
                <div className="hub-grid">
                  {completedTests.map(test => <TaskCard key={test._id} test={test} />)}
                </div>
              </section>
            )}
          </>
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

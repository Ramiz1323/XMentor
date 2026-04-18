import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import api from '../../lib/api';
import { Plus, BookOpen, Clock, CheckCircle, Target, Users } from 'lucide-react';

const MCQDashboard = () => {
  const { user } = useAuthStore();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const { data } = await api.get('/mcq/my-tests');
        setTests(data.data);
      } catch (err) {
        console.error('Failed to fetch tests', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

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
             {test.createdBy?.name?.charAt(0)}
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
        {loading ? (
          <div className="loader">Initializing Tactical Link...</div>
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

      {user.role === 'TEACHER' && user.students?.length === 0 && (
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

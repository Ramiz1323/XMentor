import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useSubjectiveStore from '../../store/useSubjectiveStore';
import useAuthStore from '../../store/useAuthStore';
import { BookOpen, Calendar, Target, ChevronRight, CheckCircle2, Clock, Plus, Trash2, Loader2 } from 'lucide-react';
import LoadingOverlay from '../../components/ui/LoadingOverlay';

const SubjectiveHub = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tests, fetchTests, deleteTest, isLoading } = useSubjectiveStore();
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchTests();

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchTests();
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }, [fetchTests]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this subjective task? All student submissions for this task will be permanently removed.')) {
      setDeletingId(id);
      try {
        await deleteTest(id);
      } catch (err) {
        alert(err.message || 'Delete failed');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const isTeacher = user?.role === 'TEACHER';

  if (isLoading && tests.length === 0) return <LoadingOverlay />;

  return (
    <div className="mcq-dashboard-container">
      <header>
        <div className="header-info">
          <h1 className="glow-text">Subjective Task Hub</h1>
          <p className="subtitle">
            {isTeacher 
              ? 'Oversee and manage your long-form written curriculum.' 
              : 'Access and manage your assigned written academic tasks.'}
          </p>
        </div>
        {isTeacher && (
          <Link to="/subjective/create" className="btn-primary">
            <Plus size={20} /> Create Task
          </Link>
        )}
      </header>

      <div className="hub-grid mt-8">
        {tests.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={64} className="empty-icon" />
            <h3>
              {isTeacher ? 'No Tasks Created' : 'No Tasks Assigned'}
            </h3>
            <p>
              {isTeacher 
                ? "You haven't architected any subjective tasks yet. Start building your curriculum to engage your students."
                : "You currently have no pending subjective tasks in this sector. Sector clear."}
            </p>
            {isTeacher && (
              <Link to="/subjective/create" className="btn-primary">
                <Plus size={20} /> Architect Your First Task
              </Link>
            )}
          </div>
        ) : (
          tests.map((test) => (
            <div 
              key={test._id} 
              className="task-card"
              onClick={() => navigate(`/subjective/${test._id}`)}
            >
              <div className="card-header">
                <div className="subject-tag">{test.subject}</div>
                <div className="card-header-right">
                  {test.submission?.status === 'GRADED' ? (
                    <div className="score-badge">
                       <Target size={14} /> 
                       <span>SCORE: <span className="score-val">{test.submission.marksObtained} / {test.maxMarks}</span></span>
                    </div>
                  ) : (
                    <div className="duration-box">
                      <div className="label">Total Marks</div>
                      <div className="value">{test.maxMarks}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="title-group">
                <h3>{test.title}</h3>
                <p className="description-preview">
                  {test.description || 'No additional instructions provided.'}
                </p>
              </div>

              <div className="card-footer">
                <div className="meta-row">
                  <div className="meta-tag">
                    <Calendar size={16} /> 
                    {new Date(test.deadline).toLocaleDateString()}
                  </div>
                  <div className="meta-tag">
                    <BookOpen size={16} />
                    {test.questions.length} Questions
                  </div>
                  {test.submission && (
                    <div className={`meta-tag ${test.submission.status === 'GRADED' ? 'success' : 'pending'}`}>
                      {test.submission.status === 'GRADED' ? (
                        <><CheckCircle2 size={16} /> Evaluation Complete</>
                      ) : (
                        <><Clock size={16} /> Pending Evaluation</>
                      )}
                    </div>
                  )}
                </div>
                <div className="btn-row">
                    <button className={`btn-primary ${test.submission?.status === 'GRADED' ? 'success' : ''}`}>
                        {isTeacher ? 'Review Paper' : (
                          test.submission 
                            ? (test.submission.status === 'GRADED' ? 'View Evaluation' : 'Pending Evaluation')
                            : 'Initiate Mission'
                        )} <ChevronRight size={18} />
                    </button>
                    {isTeacher && (
                        <button 
                            className="btn-sec btn-delete-tactical" 
                            onClick={(e) => handleDelete(e, test._id)}
                            disabled={deletingId === test._id}
                        >
                            {deletingId === test._id ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Trash2 size={18} />
                            )}
                        </button>
                    )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubjectiveHub;

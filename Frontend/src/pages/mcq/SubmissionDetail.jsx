import { ArrowLeft, CheckCircle, XCircle, Info, Clock, Target, Calendar } from 'lucide-react';
import MathRenderer from '../../components/ui/MathRenderer';

const SubmissionDetail = ({ test, submission, onClose }) => {
  if (!test || !submission) return null;

  return (
    <div className="tactical-modal-overlay">
      <div className="submission-detail-modal">
        <header className="detail-header">
          <div className="header-top">
            <button className="back-btn" onClick={onClose}>
              <ArrowLeft size={20} />
            </button>
            <div className="student-profile">
               <div className="avatar">
                 {submission.studentId?.profilePic ? (
                   <img src={submission.studentId.profilePic} alt="" />
                 ) : (
                   submission.studentId?.name?.charAt(0) || '?'
                 )}
               </div>
               <div className="info">
                  <h3>{submission.studentId?.name}</h3>
                  <p>@{submission.studentId?.username}</p>
               </div>
            </div>
          </div>
          
          <div className="task-summary-banner">
             <div className="summary-item">
                <Target size={18} />
                <div className="val">{submission.score} / {submission.total}</div>
                <div className="lab">Tactical Score</div>
             </div>
             <div className="summary-item">
                <Clock size={18} />
                <div className="val">{Math.floor(submission.timeTaken / 60)}m {submission.timeTaken % 60}s</div>
                <div className="lab">Time Elapsed</div>
             </div>
             <div className="summary-item">
                <Calendar size={18} />
                <div className="val">{new Date(submission.createdAt).toLocaleDateString()}</div>
                <div className="lab">Deployed At</div>
             </div>
          </div>
        </header>

        <div className="questions-review-list">
          {test.questions.map((q, idx) => {
            const studentAns = submission.answers[idx];
            const isCorrect = studentAns === q.correct;
            
            return (
              <div key={q._id || idx} className={`review-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="card-header">
                  <span className="q-number">Question {idx + 1}</span>
                  {isCorrect ? (
                    <span className="status-tag correct"><CheckCircle size={14} /> Critical Hit</span>
                  ) : (
                    <span className="status-tag incorrect"><XCircle size={14} /> Tactical Error</span>
                  )}
                </div>

                <div className="question-text">
                  <MathRenderer text={q.q} />
                </div>

                <div className="options-grid">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = studentAns === oIdx;
                    const isCorrectOption = q.correct === oIdx;
                    
                    let stateClass = '';
                    if (isSelected && isCorrectOption) stateClass = 'correct-selected';
                    else if (isSelected && !isCorrectOption) stateClass = 'incorrect-selected';
                    else if (isCorrectOption) stateClass = 'should-have-selected';

                    return (
                      <div key={oIdx} className={`option-box ${stateClass}`}>
                        <span className="label">{String.fromCharCode(65 + oIdx)}</span>
                        <div className="text"><MathRenderer text={opt} /></div>
                        {isSelected && (isCorrectOption ? <CheckCircle size={16} /> : <XCircle size={16} />)}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="explanation-box">
                    <div className="exp-label"><Info size={14} /> Tactical Analysis</div>
                    <div className="exp-text"><MathRenderer text={q.explanation} /></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetail;

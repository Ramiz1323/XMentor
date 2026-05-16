import { ArrowLeft, CheckCircle, Info, Target, Users, BookOpen } from 'lucide-react';
import MathRenderer from '../../components/ui/MathRenderer';

const ExamReviewModal = ({ test, results, onClose }) => {
  const safeQuestions = Array.isArray(test?.questions) ? test.questions : [];
  const safeResults = Array.isArray(results) ? results : [];

  if (!test || safeQuestions.length === 0) return null;

  // Calculate cohort performance per question
  const questionStats = safeQuestions.map((q, qIdx) => {
    const correctCount = safeResults.filter(r => Array.isArray(r.answers) && r.answers[qIdx] === q.correct).length;
    const totalAttempts = safeResults.length;
    const successRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
    return { successRate, correctCount, totalAttempts };
  });

  return (
    <div className="tactical-modal-overlay">
      <div className="submission-detail-modal exam-review-modal">
        <header className="detail-header">
          <div className="header-top">
            <button className="back-btn" onClick={onClose}>
              <ArrowLeft size={20} />
            </button>
            <div className="exam-info">
               <div className="icon-wrap"><BookOpen size={20} /></div>
               <div className="info">
                  <h3>Exam Intelligence Review</h3>
                  <p>{test.title} • {test.subject}</p>
               </div>
            </div>
          </div>
          
        </header>

        <div className="questions-review-list">
          <div className="task-summary-banner">
             <div className="summary-item">
                <Users size={18} />
                <div className="val">{safeResults.length}</div>
                <div className="lab">Total Participants</div>
             </div>
             <div className="summary-item">
                <Target size={18} />
                <div className="val">{test.totalQuestions}</div>
                <div className="lab">Total Objectives</div>
             </div>
             <div className="summary-item">
                <CheckCircle size={18} />
                <div className="val">{safeResults.length > 0 ? Math.round(safeResults.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) / safeResults.length) : 0}</div>
                <div className="lab">Avg Tactical Score</div>
             </div>
          </div>

          {safeQuestions.map((q, idx) => {
            const stats = questionStats[idx];
            
            return (
              <div key={idx} className="review-card">
                <div className="card-header">
                  <span className="q-number">Objective #{idx + 1}</span>
                  <div className="cohort-performance">
                    <span className="label">Cohort Success:</span>
                    <div className="progress-bar-mini">
                        <div className="fill" style={{ width: `${stats.successRate}%` }}></div>
                    </div>
                    <span className="rate">{stats.successRate}%</span>
                  </div>
                </div>

                <div className="question-text">
                  <MathRenderer text={q.q} />
                </div>

                <div className="options-grid">
                  {q.options.map((opt, oIdx) => {
                    const isCorrectOption = q.correct === oIdx;
                    
                    return (
                      <div key={oIdx} className={`option-box ${isCorrectOption ? 'correct-selected' : ''}`}>
                        <span className="label">{String.fromCharCode(65 + oIdx)}</span>
                        <div className="text"><MathRenderer text={opt} /></div>
                        {isCorrectOption && <CheckCircle size={16} />}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="explanation-box">
                    <div className="exp-label"><Info size={14} /> Master Solution</div>
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

export default ExamReviewModal;

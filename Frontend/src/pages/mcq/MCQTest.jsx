import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Timer, ArrowRight, ArrowLeft, CheckCircle, HelpCircle } from 'lucide-react';

const MCQTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const { data } = await api.get(`/mcq/${id}`);
        setTest(data.data);
        setAnswers(new Array(data.data.questions.length).fill(-1));
        if (!data.data.isSubmitted) {
          setTimeLeft(data.data.duration * 60);
        } else {
          setResult(data.data.result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const handleOptionSelect = (optionIdx) => {
    if (test.isSubmitted || result) return;
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (submitting || result) return;
    try {
      setSubmitting(true);
      const { data } = await api.post(`/mcq/${id}/submit`, {
        answers,
        timeTaken: test.duration * 60 - timeLeft
      });
      setResult(data.data);
      const updated = await api.get(`/mcq/${id}`);
      setTest(updated.data.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader" style={{ textAlign: 'center', color: 'white', padding: '10rem' }}>Initialising secure testing environment...</div>;

  const currentQuestion = test.questions[currentIdx];
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isCritical = timeLeft < 60;

  return (
    <div className="mcq-page">
      <header>
        <div className="test-info">
          <h1 className="glow-text">{test.title}</h1>
          <p>{test.subject} • {test.totalQuestions} Questions</p>
        </div>
        {!result && (
          <div className={`timer-box ${isCritical ? 'critical' : ''}`}>
            <Timer size={18} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </header>

      {result && (
        <div className="result-banner">
          <div className="banner-content">
            <div className="result-status">
              <CheckCircle size={32} color="#22d3ee" />
              <div>
                <h2>Test Completed</h2>
                <p>Review your performance below</p>
              </div>
            </div>
            <div className="score-display">
              <div className="score">{result.score}/{result.total}</div>
              <div className="label">Correct Answers</div>
            </div>
          </div>
        </div>
      )}

      <div className="question-container">
        <div className="progress-bar">
          {test.questions.map((_, i) => (
            <div key={i} className={`segment ${i === currentIdx ? 'active' : (answers[i] !== -1 || result ? 'completed' : '')}`} />
          ))}
        </div>

        <h3 className="question-base">
          <span className="q-num">{currentIdx + 1}.</span>
          {currentQuestion.q}
        </h3>

        <div className="options-list">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = result ? result.answers[currentIdx] === idx : answers[currentIdx] === idx;
            const isCorrect = result && currentQuestion.correct === idx;
            const isWrong = result && isSelected && !isCorrect;

            let statusClass = '';
            if (isSelected) statusClass = 'selected';
            if (isCorrect) statusClass = 'correct';
            if (isWrong) statusClass = 'wrong';

            return (
              <button
                key={idx}
                disabled={!!result}
                onClick={() => handleOptionSelect(idx)}
                className={`option-btn ${statusClass}`}
              >
                <span>{option}</span>
                {isCorrect && <CheckCircle size={18} color="#22c55e" />}
              </button>
            );
          })}
        </div>

        {result && currentQuestion.explanation && (
          <div className="explanation-box">
            <h4><HelpCircle size={14} /> Explanation</h4>
            <p>{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="navigation-footer">
          <button 
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            className="nav-btn"
          >
            <ArrowLeft size={18} /> Previous
          </button>

          {currentIdx === test.questions.length - 1 ? (
            !result && (
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ padding: '10px 30px' }}>
                {submitting ? 'Submitting...' : 'Finish Test'}
              </button>
            )
          ) : (
            <button 
              onClick={() => setCurrentIdx(prev => prev + 1)}
              className="nav-btn"
            >
              Next <ArrowRight size={18} />
            </button>
          )}

          {result && currentIdx === test.questions.length - 1 && (
             <button onClick={() => navigate('/')} className="btn-primary" style={{ padding: '10px 30px' }}>
                Done
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQTest;

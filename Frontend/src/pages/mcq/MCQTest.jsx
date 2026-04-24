import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useMCQStore from '../../store/useMCQStore';
import { Timer, ArrowRight, ArrowLeft, CheckCircle, XCircle, HelpCircle, AlertCircle, RefreshCw, Trophy, Target, Clock, Star } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import confetti from 'canvas-confetti';

const MCQTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentTest: test, fetchTestById, submitTest, isLoading, error } = useMCQStore();
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);

  const answersRef = useRef([]);
  const timeLeftRef = useRef(null);
  const testRef = useRef(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    testRef.current = test;
  }, [test]);

  useEffect(() => {
    const initTest = async () => {
      await fetchTestById(id);
    };
    initTest();
  }, [id, fetchTestById]);

  useEffect(() => {
    if (test) {
      setAnswers(new Array(test.questions.length).fill(-1));
      if (!test.isSubmitted) {
        setTimeLeft(test.duration * 60);
      } else {
        setResult(test.result);
      }
    }
  }, [test]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting || result || !testRef.current) return;
    try {
      setSubmitting(true);
      const currentAnswers = autoSubmit ? answersRef.current : answers;
      
      const timeTaken = testRef.current.hasTimer 
        ? (testRef.current.duration * 60 - (timeLeftRef.current || 0))
        : elapsedTime;
      
      const res = await submitTest(id, {
        answers: currentAnswers,
        timeTaken: Math.max(1, timeTaken)
      });
      setResult(res.data);
      setShowResultModal(true);
      triggerConfetti();
      await fetchTestById(id); 
    } catch (err) {
      if (!autoSubmit) alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }, [id, submitting, result, answers, elapsedTime, submitTest, fetchTestById]);

  useEffect(() => {
    if (!test?.hasTimer || timeLeft === null || timeLeft <= 0 || result || test?.isSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, result, test?.isSubmitted, test?.hasTimer, handleSubmit]);

  useEffect(() => {
    if (test?.hasTimer || result || test?.isSubmitted || isLoading || !test) return;
    
    const ticker = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(ticker);
  }, [test?.hasTimer, result, test?.isSubmitted, isLoading, test]);

  const handleOptionSelect = (optionIdx) => {
    if (test?.isSubmitted || result) return;
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optionIdx;
    setAnswers(newAnswers);
  };

  const TestSkeleton = () => (
    <div className="mcq-page">
      <header>
        <div className="test-info">
          <Skeleton width="200px" height="32px" className="mb-2" />
          <Skeleton width="150px" height="16px" />
        </div>
        <Skeleton width="80px" height="40px" />
      </header>
      <div className="question-container">
        <div style={{ display: 'flex', gap: '4px', marginBottom: '2rem' }}>
          {[...Array(5)].map((_, i) => <Skeleton key={i} width="100%" height="4px" />)}
        </div>
        <Skeleton width="80%" height="24px" className="mb-8" />
        <div className="options-list">
          {[...Array(4)].map((_, i) => <Skeleton key={i} width="100%" height="60px" style={{ marginBottom: '1rem' }} />)}
        </div>
      </div>
    </div>
  );

  if (isLoading && !test) return <TestSkeleton />;

  if (error || !test) {
    return (
      <div className="mcq-page">
        <div className="error-container">
          <AlertCircle size={48} className="error-icon" />
          <h2 className="glow-text">Strategic Link Failure</h2>
          <p>{error || 'Task node not found'}</p>
          <button onClick={() => fetchTestById(id)} className="btn-primary">
            <RefreshCw size={18} /> Re-establish Uplink
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentIdx];
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isCritical = timeLeft < 60;

  return (
    <div className="mcq-page">
      {/* CONGRATULATIONS MODAL */}
      {showResultModal && result && (
        <div className="result-modal-overlay">
          <div className="result-modal-card glass-card">
            <div className="modal-header">
              <div className="trophy-wrapper">
                <Trophy size={48} className="trophy-icon" />
              </div>
              <h2 className="glow-text">Congratulations!</h2>
              <p>You have successfully completed the tactical assessment.</p>
            </div>

            <div className="result-stats-grid">
              <div className="res-stat-card">
                <Star size={20} className="stat-icon score" />
                <div className="stat-value">{result.score}/{result.total}</div>
                <div className="stat-label">Final Score</div>
              </div>
              <div className="res-stat-card">
                <Target size={20} className="stat-icon accuracy" />
                <div className="stat-value">
                  {result && result.total > 0 ? Math.round((result.score / result.total) * 100) : 0}%
                </div>
                <div className="stat-label">Accuracy</div>
              </div>
              <div className="res-stat-card">
                <Clock size={20} className="stat-icon time" />
                <div className="stat-value">{formatTime(result.timeTaken)}</div>
                <div className="stat-label">Time Taken</div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowResultModal(false)} className="btn-sec full-width">
                Review Answers
              </button>
              <button onClick={() => navigate('/mcq')} className="btn-primary full-width">
                Back to Hub
              </button>
            </div>
          </div>
        </div>
      )}

      <header>
        <div className="test-info">
          <h1 className="glow-text">{test.title}</h1>
          <p>{test.subject} • {test.totalQuestions} Questions</p>
        </div>
        {!result && (
          test.hasTimer && timeLeft !== null ? (
            <div className={`timer-box ${isCritical ? 'critical' : ''}`}>
              <Timer size={18} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          ) : (
            <div className="timer-box fluid">
              <Timer size={18} />
              <span>{formatTime(elapsedTime)}</span>
            </div>
          )
        )}
      </header>

      {result && !showResultModal && (
        <div className="result-banner">
          <div className="banner-content">
            <div className="result-status">
              <CheckCircle size={32} className="complete-icon" />
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
          {currentQuestion?.q}
        </h3>

        <div className="options-list">
          {currentQuestion?.options.map((option, idx) => {
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
                <div className="option-main">
                  <span className="option-badge">{String.fromCharCode(65 + idx)}</span>
                  <span className="option-text">{option}</span>
                </div>
                {isCorrect && <CheckCircle size={20} className="success-icon" />}
                {isWrong && <XCircle size={20} className="error-icon" />}
              </button>
            );
          })}
        </div>

        {result && currentQuestion?.explanation && (
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
              <button onClick={() => handleSubmit(false)} disabled={submitting} className="btn-primary">
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
            <button onClick={() => navigate('/mcq')} className="btn-primary">
                Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQTest;

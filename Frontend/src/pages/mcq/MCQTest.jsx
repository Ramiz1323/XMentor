import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Timer, ArrowRight, ArrowLeft, CheckCircle, XCircle, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';

const MCQTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Refs to avoid stale closures in setInterval
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

  const fetchTest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/mcq/${id}`);
      const testData = data.data;
      setTest(testData);
      setAnswers(new Array(testData.questions.length).fill(-1));
      
      if (!testData.isSubmitted) {
        setTimeLeft(testData.duration * 60);
      } else {
        setResult(testData.result);
      }
    } catch (err) {
      setError(err.message || 'Transmission lost with testing module');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting || result || !testRef.current) return;
    try {
      setSubmitting(true);
      const currentAnswers = autoSubmit ? answersRef.current : answers;
      
      // Calculate time taken: use timeLeft if timer exists, otherwise use elapsedTime store
      const timeTaken = testRef.current.hasTimer 
        ? (testRef.current.duration * 60 - (timeLeftRef.current || 0))
        : elapsedTime;
      
      const { data } = await api.post(`/mcq/${id}/submit`, {
        answers: currentAnswers,
        timeTaken: Math.max(1, timeTaken)
      });
      setResult(data.data);
      const updated = await api.get(`/mcq/${id}`);
      setTest(updated.data.data);
    } catch (err) {
      if (!autoSubmit) alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }, [id, submitting, result, answers, elapsedTime]);

  useEffect(() => {
    // Timer is only active if hasTimer is true and it's not submitted
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

  // Handle Fluid missions (no timer): track elapsed time
  useEffect(() => {
    if (test?.hasTimer || result || test?.isSubmitted || loading) return;
    
    const ticker = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(ticker);
  }, [test?.hasTimer, result, test?.isSubmitted, loading]);

  const handleOptionSelect = (optionIdx) => {
    if (test?.isSubmitted || result) return;
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optionIdx;
    setAnswers(newAnswers);
  };

  if (loading) return <div className="loader">Initialising secure testing environment...</div>;

  if (error || !test) {
    return (
      <div className="mcq-page">
        <div className="error-container">
          <AlertCircle size={48} className="error-icon" />
          <h2 className="glow-text">Strategic Link Failure</h2>
          <p>{error || 'Task node not found'}</p>
          <button onClick={fetchTest} className="btn-primary">
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

      {result && (
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
             <button onClick={() => navigate('/mcq-hub')} className="btn-primary">
                Done
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQTest;

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
  const [isReady, setIsReady] = useState(false);
  const [violations, setViolations] = useState(0);
  const [securityWarning, setSecurityWarning] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [visited, setVisited] = useState([]);


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
      setVisited(new Array(test.questions.length).fill(false));
      if (!test.isSubmitted) {
        setTimeLeft(test.duration * 60);
      } else {
        setResult(test.result);
      }
    }
  }, [test]);

  useEffect(() => {
    if (isReady && !result && visited.length > 0) {
      const newVisited = [...visited];
      if (!newVisited[currentIdx]) {
        newVisited[currentIdx] = true;
        setVisited(newVisited);
      }
    }
  }, [currentIdx, isReady, result]);

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

    // Check for unanswered questions
    const currentAnswers = autoSubmit ? answersRef.current : answers;

    try {
      setSubmitting(true);
      setShowSubmitConfirm(false);

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
      setSecurityWarning(`Uplink Error: ${err.message || 'Submission failed. Please check your connection and try again.'}`);
      // If auto-submit failed, we want to stay on the page but show a clear failure state
      if (autoSubmit) {
        setSubmitting(false);
      }
    } finally {
      setSubmitting(false);
    }
  }, [id, submitting, result, answers, elapsedTime, submitTest, fetchTestById]);

  const preSubmitCheck = () => {
    const unansweredCount = answers.filter(a => a === -1).length;
    if (unansweredCount > 0) {
      setShowSubmitConfirm(true);
    } else {
      handleSubmit(false);
    }
  };

  useEffect(() => {
    if (!timeLeft || timeLeft <= 0 || result || test?.isSubmitted || !test?.hasTimer || !isReady) return;

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
  }, [timeLeft, result, test?.isSubmitted, test?.hasTimer, handleSubmit, isReady]);

  useEffect(() => {
    if (showResultModal && result) {
      const accuracy = (result.score / result.total) * 100;
      let soundPath = '';

      if (accuracy > 65) {
        // Randomize between faah and Congo
        soundPath = Math.random() > 0.5 ? '/faahhhhhhhh.mp3' : '/Congo.mp3';
      } else {
        // Low score, play laugh
        soundPath = '/Laugh.mp3';
      }

      if (soundPath) {
        const audio = new Audio(soundPath);
        audio.play().catch(e => console.error('Audio play failed:', e));
      }
    }
  }, [showResultModal, result]);

  useEffect(() => {
    if (test?.hasTimer || result || test?.isSubmitted || isLoading || !test || !isReady) return;

    const ticker = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(ticker);
  }, [test?.hasTimer, result, test?.isSubmitted, isLoading, test, isReady]);

  // FULL SECURITY MODE EFFECTS
  useEffect(() => {
    if (!isReady || result || test?.isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(v => v + 1);
        setSecurityWarning('Strategic Breach: Unauthorized tab switch detected. Focus on the mission node.');
      }
    };

    // handleBlur removed due to false positives. Security now relies on visibilitychange (tab switching).

    const handleContextMenu = (e) => {
      e.preventDefault();
      setSecurityWarning('Security Protocol: Unauthorized menu access blocked.');
    };

    const handleCopy = (e) => {
      e.preventDefault();
      setSecurityWarning('Security Protocol: Strategic data extraction blocked.');
    };

    const handleDoubleClick = (e) => {
      e.preventDefault();
    };

    const handleKeyDown = (e) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+C, Ctrl+V, Ctrl+S, Ctrl+P, Alt+Tab
      const blockedKeys = ['F12', 'PrintScreen'];
      const ctrlKeys = ['i', 'j', 'c', 'u', 'v', 's', 'p'];

      if (
        blockedKeys.includes(e.key) ||
        (e.ctrlKey && ctrlKeys.includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.altKey && e.key === 'Tab')
      ) {
        e.preventDefault();
        setSecurityWarning('Security Protocol: Tactical shortcut blocked. Operation security maintained.');
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !result && !test?.isSubmitted) {
        setIsFullScreen(false);
        setViolations(v => v + 1);
        setSecurityWarning('Strategic Breach: Tactical full-screen mode compromised. Re-establish uplink.');
      } else {
        setIsFullScreen(true);
      }
    };

    const handleBeforeUnload = (e) => {
      if (!result && !test?.isSubmitted) {
        e.preventDefault();
        e.returnValue = 'Mission in progress. Unauthorized exit will compromise data.';
        return e.returnValue;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('dblclick', handleDoubleClick);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('dblclick', handleDoubleClick);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isReady, result, test?.isSubmitted]);

  const enterFullScreen = async () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      try {
        await element.requestFullscreen();
        return true;
      } catch (err) {
        setSecurityWarning('Hardware Failure: Could not engage full-screen mode. Please ensure you haven\'t blocked the request.');
        return false;
      }
    }
    return false;
  };

  const startTest = async () => {
    const success = await enterFullScreen();
    if (success) {
      setIsReady(true);
    }
  };

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

  if (isLoading || !test) return <TestSkeleton />;

  if (error) {
    return (
      <div className="mcq-page tactical-mode">
        <div className="result-modal-overlay security-overlay">
          <div className="result-modal-card glass-card security-card">
            <div className="modal-header">
              <div className="trophy-wrapper security-icon-wrapper">
                <AlertCircle size={48} className="error-icon" />
              </div>
              <h2 className="glow-text danger">Strategic Link Failure</h2>
              <p className="security-msg">{error}</p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary full-width"
              >
                <RefreshCw size={18} style={{ marginRight: '8px' }} />
                Re-establish Uplink
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = test?.questions?.[currentIdx];
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isCritical = timeLeft < 60;

  if (!isReady && !test.isSubmitted && !result) {
    return (
      <div className="mcq-page">
        <div className="test-lobby-container">
          <div className="lobby-card glass-card">
            <div className="lobby-header">
              <div className="icon-ring">
                <Target size={32} className="accent-glow" />
              </div>
              <h1 className="glow-text">Mission Briefing</h1>
              <p>Deployment authorized for: <strong>{test.title}</strong></p>
            </div>


            <div className="lobby-rules">
              <h3>Rules of Engagement</h3>
              <ul>
                <li>The timer starts the moment you initialize the uplink.</li>
                <li>Unanswered questions are counted as <strong>failed tactical nodes</strong>.</li>
                <li>Do not refresh the page during the operation.</li>
                <li>Ensure a stable connection before proceeding.</li>
              </ul>
            </div>

            <div className="lobby-footer">
              <button onClick={() => navigate('/mcq')} className="btn-sec danger">
                Abort Mission
              </button>
              <button onClick={startTest} className="btn-primary">
                Initialize Uplink <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mcq-page">
      {/* SECURITY WARNING MODAL */}
      {/* SECURITY WARNING MODAL */}
      {securityWarning && (
        <div className="result-modal-overlay security-overlay">
          <div className="result-modal-card glass-card security-card">
            <div className="modal-header">
              <div className="trophy-wrapper security-icon-wrapper">
                <AlertCircle size={48} className="error-icon" />
              </div>
              <h2 className="glow-text danger">Security Protocol Alert</h2>
              <p className="security-msg">{securityWarning}</p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setSecurityWarning('');
                  if (!document.fullscreenElement) enterFullScreen();
                }}
                className="btn-primary full-width"
              >
                Re-engage Tactical Link
              </button>
            </div>
            {violations > 0 && (
              <p className="violation-count">Breach Count: {violations}</p>
            )}
          </div>
        </div>
      )}

      {/* SUBMISSION CONFIRMATION MODAL */}
      {showSubmitConfirm && (
        <div className="result-modal-overlay security-overlay">
          <div className="result-modal-card glass-card">
            <div className="modal-header">
              <div className="trophy-wrapper security-icon-wrapper" style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                <HelpCircle size={48} style={{ color: '#fbbf24' }} />
              </div>
              <h2 className="glow-text">Submission Warning</h2>
              <p className="security-msg">
                Tactical Alert: You have <strong>{answers.filter(a => a === -1).length}</strong> unanswered questions.
                These will be logged as <span style={{ color: '#ff4d4d' }}>FAILED NODES</span>.
                Proceed with final submission?
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="btn-sec full-width"
              >
                Continue Mission
              </button>
              <button
                onClick={() => handleSubmit(false)}
                className="btn-primary full-width"
                style={{ background: 'linear-gradient(135deg, #ff4d4d, #ff8c42)' }}
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}


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

      <div className="test-operation-layout">
        <div className="main-tactical-area">
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

            {result && result.answers[currentIdx] === -1 && (
              <div className="skipped-badge">
                <AlertCircle size={14} />
                <span>Skipped - Counted as Incorrect</span>
              </div>
            )}

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
                  <button onClick={preSubmitCheck} disabled={submitting} className="btn-primary">
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

        <aside className="tactical-monitor-sidebar">
          <div className="monitor-header">
            <h3>Tactical Grid</h3>
            <span className="status-label">Operation Sync</span>
          </div>

          <div className="question-grid">
            {test.questions.map((_, i) => {
              let status = 'normal';
              if (answers[i] !== -1) status = 'answered';
              else if (visited[i] && i !== currentIdx) status = 'skipped';
              if (i === currentIdx) status += ' active';

              return (
                <button
                  key={i}
                  className={`grid-item ${status}`}
                  onClick={() => setCurrentIdx(i)}
                  title={`Question ${i + 1}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="grid-legend">
            <div className="legend-item">
              <span className="dot answered"></span>
              <span>Answered</span>
            </div>
            <div className="legend-item">
              <span className="dot skipped"></span>
              <span>Skipped</span>
            </div>
            <div className="legend-item">
              <span className="dot normal"></span>
              <span>Pending</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MCQTest;

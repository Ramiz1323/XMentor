import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSubjectiveStore from '../../store/useSubjectiveStore';
import useAuthStore from '../../store/useAuthStore';
import { Timer, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ChevronLeft, Clock, Target, BookOpen, Zap, Landmark, Globe, ShieldAlert } from 'lucide-react';
import LoadingOverlay from '../../components/ui/LoadingOverlay';
import MathRenderer from '../../components/ui/MathRenderer';

const SubjectiveView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchTestById, submitSignal, isLoading } = useSubjectiveStore();

  const [test, setTest] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [violations, setViolations] = useState(0);
  const [securityWarning, setSecurityWarning] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [visited, setVisited] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const timeLeftRef = useRef(null);
  const testRef = useRef(null);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    testRef.current = test;
  }, [test]);

  useEffect(() => {
    const loadTest = async () => {
      try {
        const result = await fetchTestById(id);
        setTest(result.data);
        setSubmission(result.submission);

        if (result.data.hasTimer && !result.submission) {
          setTimeLeft(result.data.duration * 60);
        }
        setVisited(new Array(result.data.questions.length).fill(false));
      } catch (err) {
        console.error(err);
      }
    };
    loadTest();
  }, [id, fetchTestById]);

  useEffect(() => {
    if (isReady && !submission && visited.length > 0) {
      const newVisited = [...visited];
      if (!newVisited[currentIdx]) {
        newVisited[currentIdx] = true;
        setVisited(newVisited);
      }
    }
  }, [currentIdx, isReady, submission]);

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submission) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      const result = await submitSignal(id);
      setSubmission(result);
      setTimeLeft(null);
      setIsReady(false);
      setShowSubmitModal(false);
    } catch (err) {
      alert(err.message || "Uplink failure during submission.");
    }
  }, [id, submission, submitSignal]);

  // Timer logic
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0 || submission || !test?.hasTimer || !isReady) return;

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
  }, [timeLeft, submission, test?.hasTimer, isReady, handleSubmit]);

  // Security Protocols
  useEffect(() => {
    if (!isReady || submission) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(v => v + 1);
        setSecurityWarning('Strategic Breach: Unauthorized tab switch detected. Mission compromised.');
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !submission) {
        setIsFullScreen(false);
        setViolations(v => v + 1);
        setSecurityWarning('Strategic Breach: Tactical full-screen mode compromised. Re-establish link.');
      } else {
        setIsFullScreen(true);
      }
    };

    const handleKeyDown = (e) => {
      const blockedKeys = ['F12', 'PrintScreen'];
      if (blockedKeys.includes(e.key) || (e.ctrlKey && ['i', 'j', 'u', 'c', 'v', 's', 'p'].includes(e.key.toLowerCase()))) {
        e.preventDefault();
        setSecurityWarning('Security Protocol: Tactical shortcut blocked.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', e => e.preventDefault());

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isReady, submission]);

  const enterFullScreen = async () => {
    const element = document.documentElement;
    try {
      if (element.requestFullscreen) await element.requestFullscreen();
      return true;
    } catch (err) {
      setSecurityWarning('Hardware Failure: Could not engage full-screen mode.');
      return false;
    }
  };

  const startMission = async () => {
    const success = await enterFullScreen();
    if (success) setIsReady(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isLoading || !test) return <LoadingOverlay />;

  if (submission?.status === 'GRADED') {
    return (
      <div className="mcq-page">
        <div className="result-view-container">
          <header className="result-view-header">
            <div className="header-left">
              <button onClick={() => navigate('/subjective')} className="btn-back-hub">
                <ChevronLeft size={20} /> MISSION HUB
              </button>
              <h1 className="glow-text">{test.title}</h1>
              <p className="subtitle">{test.subject} • MISSION EVALUATION COMPLETE</p>
            </div>
            <div className="score-summary-v2">
              <div className="score-badge-large">
                <Target size={28} />
                <div className="score-info">
                  <span className="label">FINAL SCORE</span>
                  <span className="value">{submission.marksObtained} / {test.maxMarks}</span>
                </div>
              </div>
            </div>
          </header>

          <div className="questions-review-feed">
            <h3 className="section-title"><BookOpen size={20} /> Mission Intelligence Review</h3>
            {test.questions.map((q, idx) => (
              <div key={idx} className="question-review-card">
                <div className="q-meta">
                  <span className="q-index">QUESTION #{idx + 1}</span>
                  <span className="q-marks">{q.marks} PTS</span>
                </div>
                <div className="q-body">
                  <MathRenderer text={q.text} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // MISSION LOBBY
  if (!isReady) {
    const isSubmitted = !!submission;
    return (
      <div className="mcq-page">
        <div className="test-lobby-container">
          <div className="lobby-card glass-card">
            <div className="lobby-header">
              <div className="icon-ring">
                <Target size={32} className={`accent-glow ${submission ? 'success' : ''}`} />
              </div>
              <h1 className="glow-text">{submission ? 'Mission Pending' : 'Mission Briefing'}</h1>
              <p>Subjective Assessment: <strong>{test.title}</strong></p>
              {submission && <div className="status-badge success mt-2">UPLINK SUCCESSFUL - PENDING EVALUATION</div>}
            </div>

            <div className="lobby-stats-grid">
              <div className="l-stat">
                <span className="value">{test.questions.length}</span>
                <span className="label">QUESTIONS</span>
              </div>
              <div className="l-stat">
                <span className="value">{test.maxMarks}</span>
                <span className="label">MAX PTS</span>
              </div>
              {test.hasTimer && !submission && (
                <div className="l-stat">
                  <span className="value">{test.duration}M</span>
                  <span className="label">TIMER</span>
                </div>
              )}
            </div>

            <div className="lobby-rules">
              <h3>Secure Operation Protocol</h3>
              <ul>
                <li>Uplink requires <strong>Mandatory Full-Screen Mode</strong>.</li>
                <li>Tab switching will log a <strong>Security Violation</strong>.</li>
                <li>This is a <strong>Physical Solution Mission</strong>—solve in your notebook.</li>
                <li>Only click "Signal Completion" after finishing all physical work.</li>
              </ul>
            </div>

            <div className="lobby-footer">
              <button onClick={() => navigate(-1)} className="btn-sec danger">Abort Uplink</button>
              <button onClick={startMission} className="btn-primary">
                {submission ? 'Review Submission Intel' : 'Initialize Secure Link'} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mcq-page">
      {/* SECURITY OVERLAY */}
      {securityWarning && (
        <div className="result-modal-overlay security-overlay">
          <div className="result-modal-card glass-card security-card">
            <div className="modal-header">
              <div className="trophy-wrapper security-icon-wrapper">
                <ShieldAlert size={48} className="error-icon" />
              </div>
              <h2 className="glow-text danger">Security Alert</h2>
              <p className="security-msg">{securityWarning}</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => { setSecurityWarning(''); if (!document.fullscreenElement) enterFullScreen(); }} className="btn-primary full-width">
                Re-establish Link
              </button>
            </div>
            {violations > 0 && <p className="violation-count">Violations: {violations}</p>}
          </div>
        </div>
      )}

      {/* SUBMISSION CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="result-modal-overlay">
          <div className="result-modal-card glass-card">
            <div className="modal-header">
              <div className="confirmation-icon-wrapper">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="glow-text">Signal Completion?</h2>
              <p className="modal-description">
                Confirming will end your mission and uplink your signal to the mentor. You will not be able to resubmit.
              </p>
            </div>
            <div className="modal-footer-gap">
              <button onClick={() => setShowSubmitModal(false)} className="btn-sec full-width">Stay in Mission</button>
              <button onClick={() => handleSubmit(false)} className="btn-primary full-width">Final Signal</button>
            </div>
          </div>
        </div>
      )}

      <div className="test-operation-layout">
        <div className="main-tactical-area">
          <header>
            <div className="test-info">
              <h1 className="glow-text">{test.title}</h1>
              <p>{test.subject} • {test.board} • {test.language}</p>
            </div>
            {test.hasTimer && timeLeft !== null && (
              <div className={`timer-box ${timeLeft < 60 ? 'critical' : ''}`}>
                <Clock size={18} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
          </header>

          <div className="question-container">
            <div className="progress-bar">
              {test.questions.map((_, i) => (
                <div key={i} className={`segment ${i === currentIdx ? 'active' : (visited[i] ? 'completed' : '')}`} />
              ))}
            </div>

            <div className="subjective-question-display mt-8">
              <div className="q-meta-row">
                <span className="q-label">QUESTION {currentIdx + 1}</span>
                <span className="q-weight">{test.questions[currentIdx].marks} PTS</span>
              </div>
              <MathRenderer
                text={test.questions[currentIdx].text}
                className="mission-text-base"
              />

              <div className="tactical-objective-panel mt-12">
                <div className="panel-icon">
                  <AlertCircle size={24} />
                </div>
                <div className="panel-content">
                  <h4>Tactical Objective</h4>
                  <p>Solve this problem in your physical copy before proceeding.</p>
                </div>
              </div>
            </div>

            <div className="navigation-footer mt-12">
              <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(prev => prev - 1)} className="nav-btn">
                <ArrowLeft size={18} /> Previous
              </button>

              {currentIdx === test.questions.length - 1 ? (
                <button
                  onClick={() => submission ? navigate(-1) : setShowSubmitModal(true)}
                  className={`btn-primary ${submission ? 'success' : ''}`}
                >
                  {submission ? 'Exit Mission Hub' : 'Signal Final Completion'}
                </button>
              ) : (
                <button onClick={() => setCurrentIdx(prev => prev + 1)} className="nav-btn">
                  Next <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="tactical-monitor-sidebar">
          <div className="monitor-header">
            <h3>Mission Grid</h3>
            <span className="status-label">Operation Sync</span>
          </div>
          <div className="question-grid">
            {test.questions.map((_, i) => (
              <button key={i} className={`grid-item ${i === currentIdx ? 'active' : (visited[i] ? 'answered' : '')}`} onClick={() => setCurrentIdx(i)}>
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mission-stats mt-8">
            {user?.role === 'TEACHER' && (
              <div className="tactical-stat-row">
                <span className="label">Difficulty</span>
                <span className="value">{test.difficulty}</span>
              </div>
            )}
            <div className="tactical-stat-row">
              <span className="label">Progress</span>
              <span className="value">{visited.filter(v => v).length}/{test.questions.length}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SubjectiveView;

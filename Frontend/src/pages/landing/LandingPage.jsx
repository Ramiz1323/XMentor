import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Shield, Trophy, MessageSquare, BookOpen, Target,
  Users, Bell, ChevronRight, Star, Lock, Clock, ArrowRight,
  CheckCircle, Layers, Globe
} from 'lucide-react';

const LandingPage = () => {
  const heroRef = useRef(null);

  // Subtle parallax on hero bg
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.backgroundPositionY = `${window.scrollY * 0.3}px`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Target size={28} />,
      color: 'cyan',
      title: 'MCQ Tactical HUD',
      desc: 'Auto-graded MCQ tests with a fullscreen anti-cheat environment — tab-switch detection, F12 blocked, pause & resume, and bilingual (EN/BN) support.',
    },
    {
      icon: <BookOpen size={28} />,
      color: 'purple',
      title: 'Subjective Exam Engine',
      desc: 'Write and assign open-ended exams with per-question marks. Teachers manually grade answers with an EASY → EXPERT difficulty scale.',
    },
    {
      icon: <MessageSquare size={28} />,
      color: 'blue',
      title: 'Real-Time Community Chat',
      desc: 'Socket.io-powered anonymous chat rooms with access codes, custom aliases, and 30-day auto-purging messages for clean collaboration.',
    },
    {
      icon: <Trophy size={28} />,
      color: 'amber',
      title: 'Intelligent Leaderboard',
      desc: 'Teacher-scoped rankings using a weighted formula combining accuracy & participation across both MCQ and Subjective results.',
    },
    {
      icon: <Bell size={28} />,
      color: 'green',
      title: 'Live HUD Notifications',
      desc: 'Instant "INCOMING TRANSMISSION" toasts via Socket.io when tasks are assigned, graded, or doubts are resolved — with sound effects.',
    },
    {
      icon: <MessageSquare size={28} />,
      color: 'red',
      title: 'Doubt Resolution System',
      desc: 'Priority-based doubt tickets (LOW / MEDIUM / HIGH) that students raise and teachers resolve — with live resolution notifications.',
    },
  ];

  const steps = [
    { num: '01', role: 'Teacher', action: 'Creates a test', detail: 'MCQ or Subjective, sets timer, deadline, and assigns to specific students.' },
    { num: '02', role: 'Student', action: 'Gets notified instantly', detail: 'A live HUD toast appears with subject, test name, and a direct-access button.' },
    { num: '03', role: 'Student', action: 'Takes the secure exam', detail: 'Fullscreen mode, countdown timer, tactical question grid sidebar.' },
    { num: '04', role: 'Teacher', action: 'Reviews & grades', detail: 'See who completed, avg score, time taken — or grade subjective answers manually.' },
  ];

  const stats = [
    { value: '3', label: 'Active Teachers', icon: <Users size={20} /> },
    { value: '30+', label: 'Real Students', icon: <Star size={20} /> },
    { value: '2', label: 'Exam Types', icon: <Layers size={20} /> },
    { value: 'Live', label: 'Production Deployed', icon: <Globe size={20} /> },
  ];

  const techStack = [
    'React 19', 'Vite', 'SCSS', 'Zustand',
    'Node.js', 'Express.js', 'MongoDB', 'Socket.io',
    'PWA', 'JWT', 'ImageKit', 'Helmet',
  ];

  return (
    <div className="landing-page">

      {/* ─── NAVBAR ─── */}
      <nav className="landing-nav">
        <div className="landing-nav__brand">
          <span className="brand-x">X</span>Mentor
        </div>
        <div className="landing-nav__links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#tech">Tech</a>
        </div>
        <div className="landing-nav__cta">
          <Link to="/login" className="nav-btn-outline">Sign In</Link>
          <Link to="/register" className="nav-btn-filled">Get Started <ArrowRight size={14} /></Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="landing-hero" ref={heroRef}>
        <div className="hero-grid-bg" />
        <div className="hero-orb hero-orb--1" />
        <div className="hero-orb hero-orb--2" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulse-dot" />
            Live on Production · xmentor.skramizraza.tech
          </div>

          <h1 className="hero-title">
            The <span className="hero-accent">Tactical</span> Platform<br />
            Built for Real Classrooms
          </h1>

          <p className="hero-subtitle">
            XMentor is a full-stack EdTech platform used by <strong>multiple teachers</strong> and <strong>students</strong> daily.
            Assign exams, grade answers, resolve doubts, and track performance — all in one place.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn-hero-primary">
              <Zap size={18} />
              Get Started Free
            </Link>
            <Link to="/login" className="btn-hero-secondary">
              Sign In →
            </Link>
          </div>

          <div className="hero-trust">
            <CheckCircle size={14} className="trust-icon" />
            <span>No credit card required</span>
            <span className="trust-dot">·</span>
            <CheckCircle size={14} className="trust-icon" />
            <span>Deployed on production VPS</span>
            <span className="trust-dot">·</span>
            <CheckCircle size={14} className="trust-icon" />
            <span>PWA — works on mobile</span>
          </div>
        </div>

        {/* Mock HUD preview */}
        <div className="hero-mockup">
          <div className="mockup-window glass-card">
            <div className="mockup-bar">
              <span /><span /><span />
              <div className="mockup-url">xmentor.skramizraza.tech/mcq/test</div>
            </div>
            <div className="mockup-body">
              <div className="mock-header">
                <div>
                  <div className="mock-title">Trigonometry</div>
                  <div className="mock-sub">MATHS · 10 Questions</div>
                </div>
                <div className="mock-timer critical">
                  <Clock size={14} />
                  <span>0:42</span>
                </div>
              </div>
              <div className="mock-progress">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`mock-seg ${i < 3 ? 'done' : i === 3 ? 'active' : ''}`} />
                ))}
              </div>
              <div className="mock-question">
                <span className="mock-qnum">4.</span>
                If sin θ = 3/5, find the value of tan θ
              </div>
              <div className="mock-options">
                {['4/3', '3/4', '4/5', '5/3'].map((opt, i) => (
                  <div key={i} className={`mock-opt ${i === 0 ? 'selected' : ''}`}>
                    <span className="mock-badge">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </div>
                ))}
              </div>
              <div className="mock-grid-label">Tactical Grid</div>
              <div className="mock-grid">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`mock-gitem ${i < 3 ? 'answered' : i === 3 ? 'active' : ''}`}>{i + 1}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="landing-stats">
        {stats.map((s, i) => (
          <div key={i} className="stat-pill glass-card">
            <div className="stat-pill__icon">{s.icon}</div>
            <div className="stat-pill__value">{s.value}</div>
            <div className="stat-pill__label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ─── FEATURES ─── */}
      <section className="landing-features" id="features">
        <div className="section-header">
          <div className="section-tag">CAPABILITIES</div>
          <h2>Everything a classroom needs</h2>
          <p>Dual exam engines, real-time communication, and intelligent analytics — all under one roof.</p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className={`feature-card glass-card feature-card--${f.color}`}>
              <div className={`feature-icon feature-icon--${f.color}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="landing-how" id="how-it-works">
        <div className="section-header">
          <div className="section-tag">WORKFLOW</div>
          <h2>From assignment to insight in 4 steps</h2>
          <p>A seamless loop between teacher and student — powered by real-time events.</p>
        </div>

        <div className="steps-track">
          {steps.map((s, i) => (
            <div key={i} className="step-card glass-card">
              <div className="step-num">{s.num}</div>
              <div className="step-role">{s.role}</div>
              <h3 className="step-action">{s.action}</h3>
              <p className="step-detail">{s.detail}</p>
              {i < steps.length - 1 && <div className="step-connector"><ChevronRight size={20} /></div>}
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECURITY CALLOUT ─── */}
      <section className="landing-security">
        <div className="security-content glass-card">
          <div className="security-icon"><Shield size={40} /></div>
          <div>
            <h3>Exam Integrity by Design</h3>
            <p>
              MCQ tests run in mandatory fullscreen. Tab switching logs a security violation.
              F12, Ctrl+C, copy-paste, and print shortcuts are blocked.
              Students can pause and resume only if the teacher allows it — with a configurable pause limit.
            </p>
          </div>
          <div className="security-badges">
            <span className="sec-badge"><Lock size={12} /> Anti-Cheat HUD</span>
            <span className="sec-badge"><Shield size={12} /> JWT + Helmet</span>
            <span className="sec-badge"><Zap size={12} /> Rate Limited</span>
          </div>
        </div>
      </section>

      {/* ─── TECH STACK ─── */}
      <section className="landing-tech" id="tech">
        <div className="section-header">
          <div className="section-tag">STACK</div>
          <h2>Built with production-grade tech</h2>
        </div>
        <div className="tech-pills">
          {techStack.map((t, i) => (
            <span key={i} className="tech-pill">{t}</span>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="landing-cta">
        <div className="cta-orb" />
        <div className="cta-content">
          <h2>Ready to run your first tactical assessment?</h2>
          <p>Join as a teacher or student — it's free and live right now.</p>
          <div className="cta-actions">
            <Link to="/register" className="btn-hero-primary">
              <Zap size={18} />
              Create Account
            </Link>
            <Link to="/login" className="btn-hero-secondary">Already have an account? Sign In →</Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <span className="brand-x">X</span>Mentor
        </div>
        <p className="footer-tagline">Gamified Intelligence & Tactical Learning Hub</p>
        <div className="footer-links">
          <Link to="/login">Sign In</Link>
          <Link to="/register">Register</Link>
          <a href="https://xmentor.skramizraza.tech" target="_blank" rel="noreferrer">Live Demo</a>
        </div>
        <p className="footer-copy">© 2026 Ramiz. All Rights Reserved. Built with ❤️ for real classrooms.</p>
      </footer>

    </div>
  );
};

export default LandingPage;

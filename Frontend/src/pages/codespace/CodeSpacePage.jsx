import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Code2, 
  Play, 
  Save, 
  Maximize2, 
  Minimize2, 
  FileCode, 
  Palette, 
  FileJson, 
  Coffee, 
  RotateCcw, 
  Check, 
  Cloud,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import MonacoCodeEditor from '../../components/codespace/MonacoCodeEditor';
import WebOutputPreview from '../../components/codespace/WebOutputPreview';
import TerminalConsole from '../../components/codespace/TerminalConsole';
import codespaceService from '../../services/codespace.service';

const LOCAL_STORAGE_KEY = 'xmentor_codespace_state_v1';

const DEFAULT_CODES = {
  html: `<!-- XMentor Web CodeSpace -->\n<div class="card">\n  <div class="badge">PRO IDE</div>\n  <h1>Welcome to CodeSpace 🚀</h1>\n  <p>Practice HTML, CSS, & JS seamlessly from any device!</p>\n  <button id="btn">Click Me!</button>\n</div>`,
  css: `/* Custom Glassmorphic Styles */\nbody {\n  margin: 0;\n  padding: 0;\n  min-height: 100vh;\n  background: #090d16;\n  color: #e2e8f0;\n  font-family: 'Inter', system-ui, sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n.card {\n  background: rgba(30, 41, 59, 0.7);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  backdrop-filter: blur(16px);\n  border-radius: 16px;\n  padding: 2.5rem;\n  text-align: center;\n  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);\n  max-width: 400px;\n}\n\n.badge {\n  background: linear-gradient(135deg, #3b82f6, #8b5cf6);\n  color: white;\n  font-size: 0.75rem;\n  font-weight: 700;\n  padding: 0.25rem 0.75rem;\n  border-radius: 999px;\n  display: inline-block;\n  margin-bottom: 1rem;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.75rem;\n}\n\np {\n  color: #94a3b8;\n  font-size: 0.95rem;\n  line-height: 1.5;\n}\n\nbutton {\n  margin-top: 1.5rem;\n  background: #3b82f6;\n  color: white;\n  border: none;\n  padding: 0.75rem 1.5rem;\n  font-weight: 600;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n\nbutton:hover {\n  background: #2563eb;\n  transform: translateY(-2px);\n}`,
  js: `// Interactive JavaScript\nconst btn = document.getElementById('btn');\n\nbtn.addEventListener('click', () => {\n  alert('🎉 Awesome! JavaScript is running live!');\n});`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("========================================");\n        System.out.println("🚀 Welcome to XMentor Java CodeSpace!");\n        System.out.println("========================================");\n        \n        int a = 15;\n        int b = 25;\n        int sum = a + b;\n        \n        System.out.println("Calculating: " + a + " + " + b + " = " + sum);\n    }\n}`
};

const CodeSpacePage = () => {
  const [language, setLanguage] = useState('WEB'); // 'WEB' | 'JAVA'
  const [activeTab, setActiveTab] = useState('html'); // 'html' | 'css' | 'js'
  
  const [codes, setCodes] = useState(DEFAULT_CODES);
  const [title, setTitle] = useState('My Workspace');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState('Saved locally');

  // Java Execution state
  const [isExecutingJava, setIsExecutingJava] = useState(false);
  const [javaResult, setJavaResult] = useState(null);
  const [inputsList, setInputsList] = useState([]);

  // Mobile View Switcher State: 'code' | 'output' | 'split'
  const [mobileTab, setMobileTab] = useState('code');

  // Rehydrate state from localStorage + Backend sync on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.codes) setCodes(parsed.codes);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.title) setTitle(parsed.title);
      }
    } catch (e) {
      console.error('Failed to load local codespace state:', e);
    }

    // Fetch cloud saved version
    codespaceService.getCodeSpace()
      .then(res => {
        if (res.success && res.data) {
          const cloudData = res.data;
          setCodes(prev => ({
            html: cloudData.html || prev.html,
            css: cloudData.css || prev.css,
            js: cloudData.js || prev.js,
            java: cloudData.java || prev.java,
          }));
          if (cloudData.language) setLanguage(cloudData.language);
          if (cloudData.title) setTitle(cloudData.title);
          setSavedStatus('Synced with cloud');
        }
      })
      .catch(err => {
        console.warn('Cloud sync load warning:', err.message);
      });
  }, []);

  // Sync to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        codes,
        language,
        title
      }));
      setSavedStatus('Saved locally');
    } catch (e) {
      console.error('Local storage save error:', e);
    }
  }, [codes, language, title]);

  // Handle Code Changes
  const handleCodeChange = (val) => {
    if (language === 'JAVA') {
      setCodes(prev => ({ ...prev, java: val }));
    } else {
      setCodes(prev => ({ ...prev, [activeTab]: val }));
    }
  };

  // Manual Cloud Save
  const handleCloudSave = async () => {
    setIsSaving(true);
    try {
      await codespaceService.saveCodeSpace({
        title,
        language,
        html: codes.html,
        css: codes.css,
        js: codes.js,
        java: codes.java,
      });
      setSavedStatus('Synced with cloud');
      toast.success('Project saved to cloud!');
    } catch (err) {
      toast.error('Failed to save to cloud: ' + (err.message || 'Error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default template
  const handleResetTemplate = () => {
    if (window.confirm('Reset current template to default code?')) {
      if (language === 'JAVA') {
        setCodes(prev => ({ ...prev, java: DEFAULT_CODES.java }));
      } else {
        setCodes(prev => ({
          ...prev,
          html: DEFAULT_CODES.html,
          css: DEFAULT_CODES.css,
          js: DEFAULT_CODES.js,
        }));
      }
      toast.success('Reset template!');
    }
  };

  // Execute Java Code
  const handleRunJava = async (overrideInputs) => {
    setIsExecutingJava(true);
    // Switch to output tab automatically on mobile screens
    if (window.innerWidth < 768) {
      setMobileTab('output');
    }

    const activeInputs = Array.isArray(overrideInputs) ? overrideInputs : [];
    if (!Array.isArray(overrideInputs)) {
      setInputsList([]);
    }

    const stdinPayload = activeInputs.length > 0 ? activeInputs.join('\n') + '\n' : '';

    try {
      const res = await codespaceService.executeJava(codes.java, stdinPayload);
      if (res.success) {
        setJavaResult(res.data);
      } else {
        toast.error('Execution failed');
      }
    } catch (err) {
      toast.error('Failed to connect to execution engine');
      setJavaResult({
        success: false,
        output: '',
        stderr: err.response?.data?.error || err.message || 'Runner server error',
        exitCode: 1,
      });
    } finally {
      setIsExecutingJava(false);
    }
  };

  // Submit typed line from VS Code Terminal Console
  const handleTerminalSubmitInput = (newInputLine) => {
    const updatedInputs = [...inputsList, newInputLine];
    setInputsList(updatedInputs);
    handleRunJava(updatedInputs);
  };

  // Clear Terminal Window and Input State
  const handleClearTerminal = () => {
    setJavaResult(null);
    setInputsList([]);
  };

  const activeCodeValue = language === 'JAVA' ? codes.java : codes[activeTab];
  const activeEditorLang = language === 'JAVA' ? 'java' : activeTab;

  return (
    <div className={`codespace-container ${isZenMode ? 'zen-mode-active' : ''}`}>
      {/* ── Top Header Toolbar ── */}
      <header className="codespace-header">
        <div className="header-left">
          <div className="brand-badge">
            <Code2 size={20} className="brand-icon" />
            <span className="brand-title">XMentor CodeSpace</span>
          </div>

          {/* Language Selector */}
          <div className="language-selector">
            <button 
              className={`lang-btn ${language === 'WEB' ? 'active' : ''}`}
              onClick={() => setLanguage('WEB')}
              title="Web IDE (HTML/CSS/JS)"
            >
              <Sparkles size={14} /> 
              <span className="lang-name">Web</span>
              <span className="lang-detail"> (HTML/CSS/JS)</span>
            </button>
            <button 
              className={`lang-btn ${language === 'JAVA' ? 'active' : ''}`}
              onClick={() => setLanguage('JAVA')}
              title="Java IDE (JDK 15)"
            >
              <Coffee size={14} /> 
              <span className="lang-name">Java</span>
              <span className="lang-detail"> (JDK 15)</span>
            </button>
          </div>
        </div>

        <div className="header-right">
          {language === 'JAVA' && (
            <button 
              className="action-btn run-btn"
              onClick={handleRunJava}
              disabled={isExecutingJava}
            >
              <Play size={15} fill="currentColor" /> <span className="btn-text">{isExecutingJava ? 'Running...' : 'Run Java'}</span>
            </button>
          )}

          <button className="action-btn save-btn" onClick={handleCloudSave} disabled={isSaving} title="Cloud Sync">
            <Cloud size={15} /> <span className="btn-text">{isSaving ? 'Saving...' : 'Cloud Sync'}</span>
          </button>

          <button className="action-btn icon-only-btn" onClick={handleResetTemplate} title="Reset Template">
            <RotateCcw size={15} />
          </button>

          <button 
            className="action-btn icon-only-btn zen-toggle-btn"
            onClick={() => setIsZenMode(prev => !prev)}
            title={isZenMode ? "Exit Zen Mode" : "Zen Fullscreen Mode"}
          >
            {isZenMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <div className="status-indicator">
            <Check size={13} className="check-icon" />
            <span className="status-text">{savedStatus}</span>
          </div>
        </div>
      </header>

      {/* ── Mobile Pane View Switcher Bar (Visible on mobile screens < 768px) ── */}
      <nav className="mobile-view-bar" aria-label="Mobile View Switcher">
        <button 
          className={`mobile-tab-btn ${mobileTab === 'code' ? 'active' : ''}`}
          onClick={() => setMobileTab('code')}
        >
          <Code2 size={15} /> <span>Code</span>
        </button>
        <button 
          className={`mobile-tab-btn ${mobileTab === 'output' ? 'active' : ''}`}
          onClick={() => setMobileTab('output')}
        >
          <Play size={15} /> <span>{language === 'WEB' ? 'Preview' : 'Terminal'}</span>
        </button>
        <button 
          className={`mobile-tab-btn ${mobileTab === 'split' ? 'active' : ''}`}
          onClick={() => setMobileTab('split')}
        >
          <Maximize2 size={15} /> <span>Split</span>
        </button>
      </nav>

      {/* ── Main Workspace Body (Split Editor & Output) ── */}
      <main className={`codespace-workspace mobile-tab-${mobileTab}`}>
        {/* Left Pane: Code Editor */}
        <section className="editor-pane">
          {/* File Tabs for Web Mode */}
          {language === 'WEB' && (
            <div className="file-tabs">
              <button 
                className={`tab-btn ${activeTab === 'html' ? 'active' : ''}`}
                onClick={() => setActiveTab('html')}
              >
                <FileCode size={14} className="tab-icon html-icon" /> index.html
              </button>
              <button 
                className={`tab-btn ${activeTab === 'css' ? 'active' : ''}`}
                onClick={() => setActiveTab('css')}
              >
                <Palette size={14} className="tab-icon css-icon" /> styles.css
              </button>
              <button 
                className={`tab-btn ${activeTab === 'js' ? 'active' : ''}`}
                onClick={() => setActiveTab('js')}
              >
                <FileJson size={14} className="tab-icon js-icon" /> script.js
              </button>
            </div>
          )}

          {language === 'JAVA' && (
            <div className="file-tabs">
              <div className="tab-btn active">
                <Coffee size={14} className="tab-icon java-icon" /> Main.java
              </div>
            </div>
          )}

          <div className="monaco-container">
            <MonacoCodeEditor
              language={activeEditorLang}
              value={activeCodeValue}
              onChange={handleCodeChange}
            />
          </div>
        </section>

        {/* Right Pane: Live Preview or Terminal Console */}
        <section className="output-pane">
          {language === 'WEB' ? (
            <WebOutputPreview
              html={codes.html}
              css={codes.css}
              js={codes.js}
            />
          ) : (
            <TerminalConsole
              result={javaResult}
              isRunning={isExecutingJava}
              onClear={handleClearTerminal}
              inputsList={inputsList}
              onSubmitInput={handleTerminalSubmitInput}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default CodeSpacePage;

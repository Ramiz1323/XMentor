import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSubjectiveStore from '../../store/useSubjectiveStore';
import useUserStore from '../../store/useUserStore';
import { Plus, Trash2, ChevronRight, GraduationCap, BookOpen, Users, Target, X, RefreshCw, AlertCircle, Clock, Zap, Globe, Landmark } from 'lucide-react';
import GlassDropdown from '../../components/ui/GlassDropdown';
import Skeleton from '../../components/ui/Skeleton';
import MathRenderer from '../../components/ui/MathRenderer';


const SubjectiveCreator = () => {
  const navigate = useNavigate();
  const { createTest, isLoading: isCreating } = useSubjectiveStore();
  const { profile, fetchProfile, isLoading: isFetchingProfile } = useUserStore();
  
  const [creationMode, setCreationMode] = useState(null); // null, 'MANUAL', 'JSON'
  const [step, setStep] = useState(1); 
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    subject: 'MATHS',
    class: '',
    board: 'CBSE',
    language: 'English',
    difficulty: 'MEDIUM',
    hasTimer: false,
    duration: 60,
    maxMarks: 100,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedStudents: [],
    questions: [{ text: '', marks: 10 }]
  });

  const [importData, setImportData] = useState({
    subject: 'MATHS',
    class: '',
    board: 'CBSE',
    language: 'English',
    topic: '',
    difficulty: 'MEDIUM',
    hasTimer: false,
    duration: 60,
    count: 5,
    defaultMarks: 2,
    jsonText: '',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const subjectOptions = [
    { value: 'MATHS', label: 'Mathematics' },
    { value: 'PHYSICS', label: 'Physics' },
    { value: 'CHEMISTRY', label: 'Chemistry' },
    { value: 'BIOLOGY', label: 'Biology' },
    { value: 'CODING', label: 'Coding' },
    { value: 'OTHERS', label: 'Others' }
  ];

  const difficultyOptions = [
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HARD', label: 'Hard' },
    { value: 'EXPERT', label: 'Expert' }
  ];

  const boardOptions = [
    { value: 'CBSE', label: 'CBSE' },
    { value: 'ICSE', label: 'ICSE / ISC' },
    { value: 'WBCHSE', label: 'WBCHSE / WBBSE' },
    { value: 'STATE', label: 'Other State Board' },
    { value: 'IGCSE', label: 'IGCSE / IB' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Bengali', label: 'Bengali' },
    { value: 'Others', label: 'Others' }
  ];

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const students = profile?.students || [];

  const toggleStudent = (id) => {
    setTestData(prev => ({
      ...prev,
      assignedStudents: prev.assignedStudents.includes(id)
        ? prev.assignedStudents.filter(sId => sId !== id)
        : [...prev.assignedStudents, id]
    }));
  };

  const handleImport = () => {
    if (!importData.topic) return alert('Enter a Topic Name for the task.');
    if (!importData.jsonText) return alert('JSON Data field empty. Systems unresponsive.');

    try {
      let parsed = null;
      try {
        parsed = JSON.parse(importData.jsonText);
      } catch (e) {
        // Self-healing logic
        try {
          const healed = importData.jsonText
            .replace(/\\([a-zA-Z])/g, '\\\\$1')
            .replace(/\\(?!"|\\|\/|b|f|n|r|t|u)/g, '\\\\');
          parsed = JSON.parse(healed);
        } catch (err) {
          throw new Error(e.message);
        }
      }

      if (!Array.isArray(parsed)) throw new Error('Data must be a JSON array.');

      const formattedQs = parsed.map((q, index) => {
        const baseMarks = parseInt(importData.defaultMarks) || 2;
        let text = "";
        if (typeof q === 'string') text = q;
        else text = q.question || q.text || q.q || "";

        if (!text) throw new Error(`Entry ${index + 1} is invalid.`);

        // SELF-HEALING: Automatically fix over-escaped backslashes (\\\\frac -> \frac)
        const sanitizedText = text.replace(/\\\\([a-zA-Z]+)/g, '\\$1');

        return { text: sanitizedText, marks: baseMarks };
      });

      const totalMarks = formattedQs.reduce((acc, q) => acc + q.marks, 0);

      setTestData({
        ...testData,
        title: importData.topic,
        subject: importData.subject,
        class: importData.class,
        board: importData.board,
        language: importData.language,
        difficulty: importData.difficulty,
        hasTimer: importData.hasTimer,
        duration: importData.duration,
        deadline: importData.deadline,
        questions: formattedQs,
        maxMarks: totalMarks
      });

      setCreationMode('MANUAL');
      setStep(2); 
    } catch (err) {
      alert('Strategic Analysis Failed: ' + err.message);
    }

  };

  const copyPrompt = () => {
    const prompt = `Act as a high-level academic curriculum architect for ${importData.board} board. 
Language: ${importData.language}
Class/Grade: ${importData.class}
Subject: ${importData.subject}
Topic: ${importData.topic || 'General Concepts'}
Difficulty: ${importData.difficulty}

Requirement: Generate a JSON array of ${importData.count} SUBJECTIVE (Long Answer) questions. Focus on the ${importData.board} curriculum patterns. The questions MUST be written in ${importData.language}. Lengthy according to the class and marks.

CRITICAL: ALL mathematical expressions, formulas, and scientific symbols MUST be wrapped in LaTeX delimiters ($...$ for inline, $$...$$ for block). 
Always use professional LaTeX notation (e.g., \\frac{a}{b}, \\sin, \\theta, \\sqrt{x}).

IMPORTANT FOR JSON INTEGRITY: 
- Use SINGLE escaping for backslashes in your JSON response (e.g., "\\frac" in the JSON string becomes "\frac" when parsed).
- DO NOT use double-escaped backslashes like "\\\\frac" unless strictly necessary for the environment.

Format: Return ONLY a JSON array of objects. Example: [{"text": "Question with $\\frac{a}{b}$ math", "marks": ${importData.defaultMarks}}]`;
    
    navigator.clipboard.writeText(prompt);
    alert('Strategic Pro Prompt Copied!');
  };

  const handleCreate = async () => {
    if (!testData.title) return alert('Task title is required');
    if (testData.questions.some(q => !q.text.trim())) return alert('All questions must have text');
    
    try {
      let deadline = undefined;
      if (testData.deadline) {
        const dateObj = new Date(`${testData.deadline}T23:59:59`);
        deadline = dateObj.toISOString();
      }
      
      const totalMarks = testData.questions.reduce((acc, q) => acc + (parseInt(q.marks) || 0), 0);
      
      await createTest({ ...testData, deadline, maxMarks: totalMarks });
      alert('Subjective Task Deployed!');
      navigate('/');
    } catch (err) {
      alert(err.message || 'Deployment failed');
    }
  };

  const addQuestion = () => {
    setTestData({ ...testData, questions: [...testData.questions, { text: '', marks: 10 }] });
  };

  const removeQuestion = (index) => {
    if (testData.questions.length === 1) return;
    const newQs = testData.questions.filter((_, i) => i !== index);
    setTestData({ ...testData, questions: newQs });
  };

  const updateQuestion = (index, field, value) => {
    const newQs = [...testData.questions];
    newQs[index][field] = value;
    setTestData({ ...testData, questions: newQs });
  };

  if (!creationMode) {
    return (
      <div className="creation-method-selection">
        <header className="creator-header mb-12">
          <h1 className="glow-text">Strategic Task Entry</h1>
          <p className="subtitle">Select your method of subjective curriculum architecting.</p>
        </header>

        <div className="selection-grid">
          <div className="method-card" onClick={() => setCreationMode('MANUAL')}>
            <div className="icon-wrapper">
              <Plus size={32} />
            </div>
            <h3>Manual Architect</h3>
            <p>Design every task entry with absolute precision for maximum tactical engagement.</p>
            <button className="btn-primary full-width mt-4">Initiate Manual Path</button>
          </div>

          <div className="method-card json-path" onClick={() => setCreationMode('JSON')}>
            <div className="icon-wrapper">
              <BookOpen size={32} />
            </div>
            <h3>JSON Intelligence Uplink</h3>
            <p>Deploy subjective curriculum via strategic data packets or AI-generated intelligence.</p>
            <button className="btn-primary full-width mt-4 json-uplink-btn">Initiate Intelligence Uplink</button>
          </div>
        </div>

        <button onClick={() => navigate('/subjective')} className="abort-btn mt-8">
           <X size={16} /> Abort Selection
        </button>
      </div>
    );
  }

  return (
    <div className="task-creator-container">
      {creationMode === 'JSON' && (
        <div className="import-modal-overlay">
          <div className="import-modal large">
            <button className="modal-close" onClick={() => setCreationMode(null)}>
              <X size={24} />
            </button>
            <h2 className="modal-title">Import Subjective Task</h2>
            <p className="modal-subtitle">Configure strategic parameters before uplink.</p>

            <div className="import-form-grid">
              <div className="input-stack">
                <div className="input-grid two-cols">
                  <GlassDropdown 
                    label="Subject"
                    options={subjectOptions}
                    value={importData.subject}
                    onChange={(val) => setImportData({...importData, subject: val})}
                    icon={GraduationCap}
                  />
                  <div className="input-group">
                    <label>Target Class</label>
                    <input 
                      className="glass-input" 
                      placeholder="e.g. Class 10"
                      value={importData.class}
                      onChange={(e) => setImportData({...importData, class: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="input-grid two-cols">
                  <GlassDropdown 
                    label="Board"
                    options={boardOptions}
                    value={importData.board}
                    onChange={(val) => setImportData({...importData, board: val})}
                    icon={Landmark}
                  />
                  <GlassDropdown 
                    label="Language"
                    options={languageOptions}
                    value={importData.language}
                    onChange={(val) => setImportData({...importData, language: val})}
                    icon={Globe}
                  />
                </div>

                <div className="input-grid two-cols">
                  <div className="input-group">
                    <label>Topic Name</label>
                    <input 
                      className="glass-input" 
                      placeholder="e.g. Exponents"
                      value={importData.topic}
                      onChange={(e) => setImportData({...importData, topic: e.target.value})}
                    />
                  </div>
                  <GlassDropdown 
                    label="Difficulty"
                    options={difficultyOptions}
                    value={importData.difficulty}
                    onChange={(val) => setImportData({...importData, difficulty: val})}
                    icon={Zap}
                  />
                </div>

                <div className="input-grid two-cols">
                  <div className="input-group">
                        <label>Qty</label>
                        <input 
                        type="number"
                        className="glass-input" 
                        value={importData.count}
                        onChange={(e) => setImportData({...importData, count: e.target.value})}
                        />
                    </div>
                    <div className="input-group">
                        <label>Marks/Q</label>
                        <input 
                        type="number"
                        className="glass-input" 
                        value={importData.defaultMarks}
                        onChange={(e) => setImportData({...importData, defaultMarks: e.target.value})}
                        />
                    </div>
                </div>

                <div className="input-grid two-cols">
                   <div className="input-group">
                    <label>Timed Mission?</label>
                    <div className="toggle-wrapper" onClick={() => setImportData({...importData, hasTimer: !importData.hasTimer})}>
                        <div className={`toggle-btn ${importData.hasTimer ? 'active' : ''}`}>
                            <div className="slider" />
                        </div>
                        <span>{importData.hasTimer ? 'ENABLED' : 'DISABLED'}</span>
                    </div>
                  </div>
                  {importData.hasTimer && (
                      <div className="input-group animate-slide-in">
                        <label>Duration (Min)</label>
                        <input 
                        type="number"
                        className="glass-input" 
                        value={importData.duration}
                        onChange={(e) => setImportData({...importData, duration: e.target.value})}
                        />
                    </div>
                  )}
                </div>

                <div className="input-group">
                    <label>Deadline</label>
                    <input 
                      type="date"
                      className="glass-input" 
                      value={importData.deadline}
                      onChange={(e) => setImportData({...importData, deadline: e.target.value})}
                    />
                </div>

                <div className="ai-helper-zone">
                    <button className="btn-generate-prompt full-width active" onClick={copyPrompt}>
                        Generate AI Prompt
                    </button>
                </div>
              </div>

              <div className="json-textarea-wrapper">
                <div className="input-group">
                    <div className="label-with-info">
                        <label>JSON Data (Array of strings or objects)</label>
                        <AlertCircle size={14} />
                    </div>
                </div>
                <textarea 
                  placeholder={`["Question 1...", "Question 2..."] or [{"text": "Q...", "marks": 2}, ...]`}
                  value={importData.jsonText}
                  onChange={(e) => setImportData({...importData, jsonText: e.target.value})}
                />
              </div>
            </div>

            <div className="modal-actions">
               <button className="btn-cancel" onClick={() => setCreationMode(null)}>Cancel</button>
               <button className="btn-import" onClick={handleImport}>
                  <RefreshCw size={20} /> Import & Start
               </button>
            </div>
          </div>
        </div>
      )}

      <header className="creator-header">
        <div>
          <h1 className="glow-text">Task Architect</h1>
          <p className="subtitle">Design long-form written tasks for physical evaluation.</p>
        </div>
        <div className="step-dots">
          {[1, 2, 3].map(s => (
            <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`}>{s}</div>
          ))}
        </div>
      </header>

      <div className="creator-card">
        {step === 1 && (
          <div className="step-content">
            <h3 className="section-title">
              <Plus size={20} className="step-icon" /> Task Identity
            </h3>
            <div className="input-stack">
              <div className="input-group">
                <label>Task Title</label>
                <input 
                  value={testData.title}
                  onChange={(e) => setTestData({...testData, title: e.target.value})}
                  className="glass-input" 
                  placeholder="e.g. Calculus & Integration Deep Dive"
                />
              </div>
              <div className="input-group">
                <label>Description (Optional)</label>
                <textarea 
                  value={testData.description}
                  onChange={(e) => setTestData({...testData, description: e.target.value})}
                  className="glass-input" 
                  placeholder="Additional instructions for the student..."
                  rows={2}
                />
              </div>
              <div className="input-grid">
                <GlassDropdown 
                  label="Subject"
                  options={subjectOptions}
                  value={testData.subject}
                  onChange={(val) => setTestData({...testData, subject: val})}
                  icon={GraduationCap}
                />
                <div className="input-group">
                    <label>Target Class</label>
                    <input 
                      className="glass-input" 
                      placeholder="e.g. Class 10"
                      value={testData.class}
                      onChange={(e) => setTestData({...testData, class: e.target.value})}
                    />
                </div>
              </div>
              <div className="input-grid">
                <GlassDropdown 
                  label="Board"
                  options={boardOptions}
                  value={testData.board}
                  onChange={(val) => setTestData({...testData, board: val})}
                  icon={Landmark}
                />
                <GlassDropdown 
                  label="Language"
                  options={languageOptions}
                  value={testData.language}
                  onChange={(val) => setTestData({...testData, language: val})}
                  icon={Globe}
                />
              </div>
              <div className="input-grid">
                <GlassDropdown 
                  label="Difficulty"
                  options={difficultyOptions}
                  value={testData.difficulty}
                  onChange={(val) => setTestData({...testData, difficulty: val})}
                  icon={Zap}
                />
                <div className="input-group">
                    <label>Deadline</label>
                    <input 
                    type="date"
                    value={testData.deadline}
                    onChange={(e) => setTestData({...testData, deadline: e.target.value})}
                    className="glass-input" 
                    />
                </div>
              </div>
              <div className="input-grid two-cols">
                   <div className="input-group">
                    <label>Timed Mission?</label>
                    <div className="toggle-wrapper" onClick={() => setTestData({...testData, hasTimer: !testData.hasTimer})}>
                        <div className={`toggle-btn ${testData.hasTimer ? 'active' : ''}`}>
                            <div className="slider" />
                        </div>
                        <span>{testData.hasTimer ? 'ENABLED' : 'DISABLED'}</span>
                    </div>
                  </div>
                  {testData.hasTimer && (
                      <div className="input-group animate-slide-in">
                        <label>Duration (Min)</label>
                        <input 
                        type="number"
                        className="glass-input" 
                        value={testData.duration}
                        onChange={(e) => setTestData({...testData, duration: e.target.value})}
                        />
                    </div>
                  )}
                </div>
            </div>

            <button className="btn-primary full-width mt-6" onClick={() => setStep(2)}>
              Continue to Architect Questions <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2 className="section-title"><BookOpen size={24} className="step-icon" /> Task Paper</h2>
            
            {testData.questions.map((q, idx) => (
              <div key={idx} className="question-editor-card">
                <div className="q-editor-header">
                  <span className="q-editor-label">QUESTION #{idx + 1}</span>
                  <div className="q-editor-actions">
                    <div className="marks-input-group">
                        <Target size={14} />
                        <input 
                            type="number" 
                            value={q.marks} 
                            onChange={(e) => updateQuestion(idx, 'marks', e.target.value)} 
                            placeholder="Marks"
                        />
                        <span className="pts-label">PTS</span>
                    </div>
                    <button onClick={() => removeQuestion(idx)} className="btn-sec icon-only danger btn-delete-tactical">
                        <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <textarea 
                  className="glass-input"
                  placeholder="Enter the problem statement..."
                  value={q.text}
                  onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                  rows={4}
                />

                {q.text && (
                  <div className="math-preview-box">
                    <span className="preview-label">Live Preview:</span>
                    <MathRenderer text={q.text} />
                  </div>
                )}
              </div>
            ))}

            <button onClick={addQuestion} className="btn-sec full-width dashed">
              <Plus size={18} /> Add Another Question
            </button>

            <div className="action-row mt-6">
              <button className="btn-sec" onClick={() => setStep(1)}>Adjust Identity</button>
              <button className="btn-primary" onClick={() => setStep(3)}>
                Target Participants <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2 className="section-title"><Users size={24} className="step-icon" /> Participant Targeting</h2>
            <p className="section-desc">Deploy this subjective task to specific students.</p>
            
            <div className="targeting-grid">
              {students.map(student => (
                <div 
                  key={student._id} 
                  className={`student-select-card ${testData.assignedStudents.includes(student._id) ? 'selected' : ''}`}
                  onClick={() => toggleStudent(student._id)}
                >
                  <div className="avatar">{student.name.charAt(0)}</div>
                  <div className="student-info">
                    <div className="student-name">{student.name}</div>
                    <div className="student-handle">@{student.username}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="action-row mt-8">
              <button className="btn-sec" onClick={() => setStep(2)}>Back to Paper</button>
              <button className="btn-primary" onClick={handleCreate} disabled={isCreating}>
                {isCreating ? 'Deploying...' : 'Finalize & Deploy Task'}
              </button>
            </div>
          </div>
        )}
      </div>

      <button onClick={() => setCreationMode(null)} className="abort-btn">
        <X size={16} /> Change Creation Method
      </button>
    </div>
  );
};

export default SubjectiveCreator;

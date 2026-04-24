import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useMCQStore from '../../store/useMCQStore';
import useUserStore from '../../store/useUserStore';
import { Plus, Trash2, X, ChevronRight, GraduationCap, BookOpen, Users, Target, AlertCircle, RefreshCw } from 'lucide-react';
import GlassDropdown from '../../components/ui/GlassDropdown';
import Skeleton from '../../components/ui/Skeleton';

const MCQCreator = () => {
  const navigate = useNavigate();
  const { createTest, isLoading: isCreating } = useMCQStore();
  const { profile, fetchProfile, isLoading: isFetchingProfile } = useUserStore();
  
  const [creationMode, setCreationMode] = useState(null); // null, 'MANUAL', 'JSON'
  const [step, setStep] = useState(1); 
  const [testData, setTestData] = useState({
    title: '',
    subject: 'CODING',
    duration: 10,
    hasTimer: true,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 3 days
    language: 'english',
    assignedStudents: [],
    questions: [
      { q: '', options: ['', '', '', ''], correct: 0, explanation: '' }
    ]
  });

  const [importData, setImportData] = useState({
    subject: 'CODING',
    topic: '',
    difficulty: 'MEDIUM',
    count: 10,
    jsonText: '',
    hasTimer: true,
    board: 'CBSE',
    classLevel: '12',
    marksPerQ: 4,
    isLengthy: true,
    language: 'english',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const boardOptions = [
    { value: 'CBSE', label: 'CBSE' },
    { value: 'ICSE', label: 'ICSE' },
    { value: 'WBBSE', label: 'WBBSE (WB Board)' },
    { value: 'WBCHSE', label: 'WBCHSE (Higher Sec.)' },
    { value: 'CODING', label: 'Coding / Technical' }
  ];

  const difficultyOptions = [
    { value: 'EASY', label: 'Beginner' },
    { value: 'MEDIUM', label: 'Intermediate' },
    { value: 'HARD', label: 'Advanced' }
  ];

  const subjectOptions = [
    { value: 'MATHS', label: 'Mathematics' },
    { value: 'PHYSICS', label: 'Physics' },
    { value: 'CHEMISTRY', label: 'Chemistry' },
    { value: 'BIOLOGY', label: 'Biology' },
    { value: 'CODING', label: 'Coding' },
    { value: 'OTHERS', label: 'Others' }
  ];
  
  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'bengali', label: 'Bengali' }
  ];

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const students = profile?.students || [];

  const handleImport = () => {
    if (!importData.topic) return alert('Enter a Topic Name for the mission.');
    if (!importData.jsonText) return alert('JSON Data field empty. Systems unresponsive.');

    try {
      const parsed = JSON.parse(importData.jsonText);
      if (!Array.isArray(parsed)) throw new Error('Data must be a JSON array of question objects.');

      const formattedQs = parsed.map((q, index) => {
        const qNum = index + 1;
        
        // 1. Validate Question Text
        const questionText = q.question || q.q || '';
        if (!questionText) throw new Error(`Question ${qNum}: Text content missing.`);

        // 2. Normalize and Validate Options (exactly 4)
        let rawOptions = q.options || [];
        if (!Array.isArray(rawOptions)) rawOptions = [];
        
        // Truncate or Pad to exactly 4
        const finalOptions = [...rawOptions].slice(0, 4);
        while (finalOptions.length < 4) {
          finalOptions.push(""); 
        }
        
        // Ensure all entries are strings
        const normalizedOptions = finalOptions.map(opt => String(opt || ''));

        // 3. Validate Answer Index (0-3)
        let ansIdx = q.answer !== undefined ? q.answer : (q.correct !== undefined ? q.correct : 0);
        ansIdx = parseInt(ansIdx, 10);
        
        if (isNaN(ansIdx) || ansIdx < 0 || ansIdx > 3) {
           throw new Error(`Question ${qNum}: Invalid answer index "${ansIdx}". Must be between 0-3.`);
        }

        return {
          q: questionText,
          options: normalizedOptions,
          correct: ansIdx,
          explanation: String(q.explanation || '')
        };
      });

      setTestData({
        ...testData,
        title: importData.topic,
        subject: importData.subject,
        hasTimer: importData.hasTimer,
        deadline: importData.deadline,
        language: importData.language,
        questions: formattedQs
      });

      setCreationMode('MANUAL');
      setStep(3); // Jump to targeting
    } catch (err) {
      alert('Strategic Analysis Failed: ' + err.message);
    }
  };

  const copyPrompt = () => {
    const complexityTxt = importData.isLengthy 
      ? 'Focus on lengthy, multi-step calculative problems where students need to solve on paper before selecting the option (JEE Style).' 
      : 'Focus on conceptual clarity and rapid theoretical analysis.';

    const prompt = `Act as a high-level academic curriculum architect. Generate a JSON array of ${importData.count} MCQ questions for class ${importData.classLevel} students studying ${importData.board || 'Standards'}.
The entire content (questions, options, and explanations) MUST be in ${importData.language === 'bengali' ? 'BENGALI' : 'ENGLISH'} language.
Subject: ${importData.subject}
Topic: ${importData.topic || 'General Concepts'}
Difficulty: ${importData.difficulty}
Weightage: ${importData.marksPerQ} Marks per question
Instruction: ${complexityTxt}

Format strictly as a JSON array: [{"question": "...", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "..."}]
Note: 'answer' must be the index (0-3) of the correct option. Return ONLY the JSON array packet. 
Keep double check that the questions should be easy to understand and in simple language and also double check for correct answers should not be wrong.`;
    
    navigator.clipboard.writeText(prompt);
    alert('Strategic Intelligence Prompt Copied!');
  };

  const handleCreate = async () => {
    if (!testData.title) return alert('Task title is required');
    if (testData.questions.some(q => !q.q)) return alert('All questions must have text');
    if (testData.questions.some(q => q.options.some(opt => !opt.trim()))) {
      return alert('All options must be filled before task deployment');
    }
    
    try {
      await createTest(testData);
      alert('Task Deployed Successfully!');
      navigate('/mcq');
    } catch (err) {
      alert(err.message || 'Deployment failed');
    }
  };

  const addQuestion = () => {
    setTestData({
      ...testData,
      questions: [...testData.questions, { q: '', options: ['', '', '', ''], correct: 0, explanation: '' }]
    });
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

  const toggleStudent = (sId) => {
    const isSelected = testData.assignedStudents.includes(sId);
    if (isSelected) {
      setTestData({ ...testData, assignedStudents: testData.assignedStudents.filter(id => id !== sId) });
    } else {
      setTestData({ ...testData, assignedStudents: [...testData.assignedStudents, sId] });
    }
  };

  const stepForward = (next) => {
    if (step === 1 && !testData.title) return alert('Task title is required');
    setStep(next);
  };

  const TargetingSkeleton = () => (
    <div className="targeting-grid">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="student-select-card skeleton-card">
          <Skeleton width="40px" height="40px" variant="circle" />
          <div className="student-info" style={{ width: '100%' }}>
            <Skeleton width="60%" height="16px" className="mb-1" />
            <Skeleton width="40%" height="12px" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!creationMode) {
    return (
      <div className="creation-method-selection">
        <header className="creator-header" style={{ marginBottom: '4rem' }}>
          <h1 className="glow-text">Strategic Entry Point</h1>
          <p className="subtitle">Select your method of curriculum architecting.</p>
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
            <p>Deploy curriculum via strategic data packets or ChatGPT-generated intelligence.</p>
            <button className="btn-primary full-width mt-4" style={{ background: 'linear-gradient(135deg, #ff4d4d, #ff8c42)' }}>Initiate Intelligence Uplink</button>
          </div>
        </div>

        <button onClick={() => navigate('/mcq')} className="abort-btn mt-8">
           <X size={16} /> Abort Selection
        </button>
      </div>
    );
  }

  return (
    <div className="task-creator-container">
      {creationMode === 'JSON' && (
        <div className="import-modal-overlay">
          <div className="import-modal">
            <button className="modal-close" onClick={() => setCreationMode(null)}>
              <X size={24} />
            </button>
            <h2 className="modal-title">Import MCQ Test</h2>
            <p className="modal-subtitle">Paste your ChatGPT generated JSON below.</p>

            <div className="import-form-grid">
              <div className="input-stack">
                <div className="input-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <GlassDropdown 
                    label="Subject"
                    options={subjectOptions}
                    value={importData.subject}
                    onChange={(val) => setImportData({...importData, subject: val})}
                    icon={GraduationCap}
                  />
                  <GlassDropdown 
                    label="Board / Curriculum"
                    options={boardOptions}
                    value={importData.board}
                    onChange={(val) => setImportData({...importData, board: val})}
                    icon={BookOpen}
                  />
                </div>
                
                <div className="input-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Topic Name</label>
                    <input 
                      className="glass-input" 
                      placeholder="Mission Topic..."
                      value={importData.topic}
                      onChange={(e) => setImportData({...importData, topic: e.target.value})}
                    />
                  </div>
                  <div className="input-group">
                    <label>Target Class</label>
                    <input 
                      className="glass-input" 
                      placeholder="e.g. 12"
                      value={importData.classLevel}
                      onChange={(e) => setImportData({...importData, classLevel: e.target.value})}
                    />
                  </div>
                </div>

                <div className="input-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                   <GlassDropdown 
                    label="Proficiency"
                    options={difficultyOptions}
                    value={importData.difficulty}
                    onChange={(val) => setImportData({...importData, difficulty: val})}
                    icon={Target}
                  />
                  <div className="input-group">
                    <label>Qty</label>
                    <input 
                      type="number"
                      className="glass-input" 
                      value={importData.count}
                      onChange={(e) => setImportData({...importData, count: e.target.value})}
                    />
                  </div>
                  <GlassDropdown 
                    label="Language"
                    options={languageOptions}
                    value={importData.language}
                    onChange={(val) => setImportData({...importData, language: val})}
                    icon={BookOpen}
                  />
                </div>

                <div className="input-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Marks / Q</label>
                    <input 
                      type="number"
                      className="glass-input" 
                      value={importData.marksPerQ}
                      onChange={(e) => setImportData({...importData, marksPerQ: e.target.value})}
                    />
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
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="tactical-toggle mt-2">
                    <span>Timed Task</span>
                    <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={importData.hasTimer}
                          onChange={() => setImportData({...importData, hasTimer: !importData.hasTimer})}
                        />
                        <span className="slider"></span>
                    </label>
                  </div>
                  <div className="tactical-toggle mt-2">
                    <span>Lengthy</span>
                    <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={importData.isLengthy}
                          onChange={() => setImportData({...importData, isLengthy: !importData.isLengthy})}
                        />
                        <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div className="ai-helper-zone">
                    <button className="btn-generate-prompt full-width active" onClick={copyPrompt}>
                        Generate Prompt for AI
                    </button>
                    <p className="prompt-help-text">Metadata synced. Click to copy strategic prompt.</p>
                </div>
              </div>

              <div className="json-textarea-wrapper">
                <div className="input-group">
                    <div className="label-with-info">
                        <label>JSON Data</label>
                        <AlertCircle size={14} />
                    </div>
                </div>
                <textarea 
                  placeholder={`[ { "question": "...", "options": [...], "answer": 0 } ]`}
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
          <p className="subtitle">Design customized training tasks for your cohort.</p>
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
                  placeholder="e.g. Adv. React Lifecycle Patterns"
                />
              </div>
              <div className="input-grid">
                <GlassDropdown 
                  label="Curriculum"
                  options={subjectOptions}
                  value={testData.subject}
                  onChange={(val) => setTestData({...testData, subject: val})}
                  icon={GraduationCap}
                />
                <GlassDropdown 
                  label="Language"
                  options={languageOptions}
                  value={testData.language}
                  onChange={(val) => setTestData({...testData, language: val})}
                  icon={BookOpen}
                />
              </div>
              <div className="input-grid">
                <div className="input-group">
                  <label>Duration (Minutes)</label>
                  <input 
                    type="number"
                    value={testData.duration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTestData({...testData, duration: isNaN(val) ? 0 : val});
                    }}
                    className="glass-input" 
                  />
                </div>
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
              <div className="action-row mt-2">
                <div 
                  onClick={() => setTestData({...testData, hasTimer: !testData.hasTimer})}
                  className={`glass-input toggle-input ${testData.hasTimer ? 'active' : ''}`}
                >
                  {testData.hasTimer ? 'Tactical Countdown Active' : 'Fluid Analysis Mode'}
                </div>
              </div>
            </div>

            <button 
              className="btn-primary full-width mt-6" 
              onClick={() => stepForward(2)}
            >
              Continue to Architect Questions <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h2 className="section-title"><BookOpen size={24} className="step-icon" /> Question Database</h2>
            
            {testData.questions.map((q, idx) => (
              <div key={idx} className="question-editor-card">
                <div className="q-header">
                  <span className="q-label">TASK ENTRY #{idx + 1}</span>
                  <button onClick={() => removeQuestion(idx)} className="btn-sec icon-only"><Trash2 size={16} /></button>
                </div>

                <textarea 
                  className="glass-input"
                  placeholder="Enter high-level theoretical question..."
                  value={q.q}
                  onChange={(e) => updateQuestion(idx, 'q', e.target.value)}
                />

                <div className="option-grid">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="option-item">
                      <div className="input-wrapper">
                        <span className="option-label">{String.fromCharCode(65 + oIdx)}</span>
                        <input 
                          className={`glass-input ${q.correct === oIdx ? 'selected' : ''}`}
                          placeholder={`Option ${oIdx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...q.options];
                            newOpts[oIdx] = e.target.value;
                            updateQuestion(idx, 'options', newOpts);
                          }}
                        />
                      </div>
                      <div 
                        onClick={() => updateQuestion(idx, 'correct', oIdx)}
                        className={`correct-toggle ${q.correct === oIdx ? 'active' : ''}`}
                      >
                        {q.correct === oIdx ? 'CORRECT' : 'SET CORRECT'}
                      </div>
                    </div>
                  ))}
                </div>

                <input 
                  className="glass-input mt-2"
                  placeholder="Solution Explanation (Optional)..."
                  value={q.explanation}
                  onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)}
                />
              </div>
            ))}

            <button onClick={addQuestion} className="btn-sec full-width dashed">
              <Plus size={18} /> Inject New Task Entry
            </button>

            <div className="action-row mt-6">
              <button className="btn-sec" onClick={() => setStep(1)}>Adjust Intel</button>
              <button 
                className="btn-primary" 
                onClick={() => stepForward(3)}
              >
                Finalize Target Subjects <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h2 className="section-title"><Users size={24} className="step-icon" /> Task Targeting</h2>
            <p className="section-desc">Deploy this task to specific students in your cohort. Leave unselected for a Public Curriculum Task.</p>
            
            {isFetchingProfile ? (
              <TargetingSkeleton />
            ) : students.length === 0 ? (
              <div className="empty-cohort-msg">
                <p>No students detected in your network. Use <strong>Profile</strong> to recruit participants.</p>
              </div>
            ) : (
              <div className="targeting-grid">
                {students.map(student => (
                  <div 
                    key={student._id} 
                    className={`student-select-card ${testData.assignedStudents.includes(student._id) ? 'selected' : ''}`}
                    onClick={() => toggleStudent(student._id)}
                  >
                    <div className="avatar">
                      {student.name.charAt(0)}
                    </div>
                    <div className="student-info">
                      <div className="student-name">{student.name}</div>
                      <div className="student-handle">@{student.username}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="action-row mt-8">
              <button className="btn-sec" onClick={() => setStep(creationMode === 'JSON' ? 1 : 2)}>Adjust Intel</button>
              <button 
                className="btn-primary" 
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? 'Deploying...' : 'Finalize and Deploy Task'}
              </button>
            </div>

            <div className="task-summary">
              Targeting {testData.assignedStudents.length} Students • {testData.questions.length} Questions • Subject: {testData.subject}
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

export default MCQCreator;

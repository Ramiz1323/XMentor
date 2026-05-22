import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useMCQStore from '../../store/useMCQStore';
import useUserStore from '../../store/useUserStore';
import { Plus, Trash2, X, ChevronRight, GraduationCap, BookOpen, Users, Target, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import GlassDropdown from '../../components/ui/GlassDropdown';
import Skeleton from '../../components/ui/Skeleton';
import MathRenderer from '../../components/ui/MathRenderer';
import { generateQA } from '../../services/ai.service';


const MCQCreator = () => {
  const navigate = useNavigate();
  const { createTest, isLoading: isCreating } = useMCQStore();
  const { profile, fetchProfile, isLoading: isFetchingProfile } = useUserStore();
  
  const [creationMode, setCreationMode] = useState(null); // null, 'MANUAL', 'JSON'
  const [step, setStep] = useState(1); 
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testData, setTestData] = useState({
    title: '',
    subject: 'CODING',
    duration: 10,
    hasTimer: true,
    pauseLimit: 0,
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
    pauseLimit: 0,
    duration: 10,
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

  const classOptions = [
    { value: '1', label: 'Class 1' },
    { value: '2', label: 'Class 2' },
    { value: '3', label: 'Class 3' },
    { value: '4', label: 'Class 4' },
    { value: '5', label: 'Class 5' },
    { value: '6', label: 'Class 6' },
    { value: '7', label: 'Class 7' },
    { value: '8', label: 'Class 8' },
    { value: '9', label: 'Class 9' },
    { value: '10', label: 'Class 10' },
    { value: '11', label: 'Class 11' },
    { value: '12', label: 'Class 12' },
    { value: 'UG', label: 'Undergraduate' },
    { value: 'PG', label: 'Postgraduate' }
  ];

  const subjectOptions = [
    { value: 'MATHS', label: 'Mathematics' },
    { value: 'SCIENCE', label: 'General Science' },
    { value: 'PHYSICS', label: 'Physics' },
    { value: 'CHEMISTRY', label: 'Chemistry' },
    { value: 'BIOLOGY', label: 'Biology' },
    { value: 'HISTORY', label: 'History' },
    { value: 'GEOGRAPHY', label: 'Geography' },
    { value: 'ENGLISH', label: 'English' },
    { value: 'BENGALI', label: 'Bengali' },
    { value: 'HINDI', label: 'Hindi' },
    { value: 'EVS', label: 'EVS' },
    { value: 'SOCIAL_SCIENCE', label: 'Social Science' },
    { value: 'COMPUTER', label: 'Computer Science' },
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

  const handleAIGenerate = async () => {
    if (!importData.topic) return alert('Enter a Topic Name for the mission.');
    setIsGenerating(true);
    try {
      const response = await generateQA({
        subject: importData.subject,
        topic: importData.topic,
        difficulty: importData.difficulty,
        count: parseInt(importData.count) || 10,
        language: importData.language,
        classLevel: importData.classLevel,
        board: importData.board,
        marksPerQ: parseInt(importData.marksPerQ) || 4,
        isLengthy: importData.isLengthy,
        type: 'MCQ'
      });
      if (response.success && response.data) {
        setImportData({ ...importData, jsonText: response.data });
      }
    } catch (err) {
      alert('AI Generation Failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImport = () => {
    if (!importData.topic) return alert('Enter a Topic Name for the mission.');
    if (!importData.jsonText) return alert('JSON Data field empty. Systems unresponsive.');

    try {
      let cleanJson = importData.jsonText.trim();
      
      // Self-healing: Remove Markdown block wrappers if AI included them
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
      }

      // PRE-PARSE NORMALIZATION:
      // ChatGPT often sends raw backslashes (e.g. \theta) which JSON.parse interprets as 
      // control characters (like \t for tab) instead of LaTeX commands.
      // We double the backslashes for any LaTeX-like command to ensure integrity.
      let normalizedJson = cleanJson.replace(/\\([a-zA-Z])/g, (match, p1) => {
        // If it's a known non-LaTeX escape that might be intentional (like \n), we could skip it,
        // but for MCQ content, almost all \letter patterns are LaTeX (like \sin, \theta).
        // Therefore, we double them to ensure they reach the LaTeX renderer intact.
        return '\\\\' + p1;
      });

      let parsed = null;
      try {
        parsed = JSON.parse(normalizedJson);
      } catch (e) {
        // Fallback: If normalization failed, try the original or a generic escape
        try {
          parsed = JSON.parse(cleanJson);
        } catch (err) {
          try {
            const extremeHeal = cleanJson.replace(/\\/g, '\\\\');
            parsed = JSON.parse(extremeHeal);
          } catch (lastErr) {
             console.error('JSON Parse failed:', e);
             throw new Error('Tactical Malform: JSON parsing failed. Ensure the format is a valid array of objects.');
          }
        }
      }

      if (!Array.isArray(parsed)) throw new Error('Data must be a JSON array of question objects.');
      
      // ... (rest of the logic)
      const formattedQs = parsed.map((q, index) => {
        const qNum = index + 1;
        const questionText = q.question || q.q || '';
        if (!questionText) throw new Error(`Question ${qNum}: Text content missing.`);

        let rawOptions = q.options || [];
        if (!Array.isArray(rawOptions)) rawOptions = [];
        const finalOptions = [...rawOptions].slice(0, 4);
        while (finalOptions.length < 4) finalOptions.push("");
        const normalizedOptions = finalOptions.map(opt => String(opt || ''));

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
        duration: parseInt(importData.duration) || 10,
        deadline: importData.deadline,
        language: importData.language,
        pauseLimit: parseInt(importData.pauseLimit) || 0,
        questions: formattedQs
      });

      setCreationMode('MANUAL');
      setStep(3); 
    } catch (err) {
      alert('Strategic Analysis Failed: ' + err.message);
    }

  };

  const copyPrompt = () => {
    const complexityTxt = importData.isLengthy 
      ? 'Focus on lengthy, multi-step calculative and theory based problems where students need to solve on paper before selecting the option (JEE/NEET/WBCHSE Style).' 
      : 'Focus on conceptual clarity and rapid theoretical analysis.';

    let subjectSpecificRules = '';
    const sub = importData.subject;
    if (sub === 'PHYSICS' || sub === 'SCIENCE') {
      subjectSpecificRules = `
PHYSICS/SCIENCE RULES:
- ALL units MUST be in LaTeX (e.g., $m/s^2$, $kg \\cdot m/s$).
- Use scientific notation in LaTeX (e.g., $3 \\times 10^8 m/s$).
- Ensure numerical accuracy for all kinematic, dynamic, and electromagnetic calculations.`;
    } else if (sub === 'CHEMISTRY') {
      subjectSpecificRules = `
CHEMISTRY RULES:
- Use LaTeX for all chemical formulas (e.g., $H_2SO_4$, $Fe^{2+}$).
- Use LaTeX for equilibrium arrows and reactions (e.g., $\\rightarrow$, $\\rightleftharpoons$).`;
    } else if (sub === 'BIOLOGY') {
      subjectSpecificRules = `
BIOLOGY RULES:
- Focus on precise anatomical and physiological terminology.
- For diagram-based questions, provide a clear textual description of the visual setup.`;
    } else if (sub === 'HISTORY' || sub === 'GEOGRAPHY' || sub === 'SOCIAL_SCIENCE') {
      subjectSpecificRules = `
HUMANITIES RULES:
- Ensure strict chronological accuracy and date verification for History.
- Use precise geographic coordinates and terminology for Geography.
- Focus on authentic data and civic frameworks for Social Sciences.`;
    } else if (sub === 'ENGLISH' || sub === 'BENGALI' || sub === 'HINDI') {
      subjectSpecificRules = `
LANGUAGE RULES:
- Focus on complex grammar, sophisticated vocabulary, and literary devices.
- For comprehension, ensure the "answer" is strictly derivable from the provided context.`;
    } else if (sub === 'COMPUTER' || sub === 'CODING') {
      subjectSpecificRules = `
COMPUTING RULES:
- Use LaTeX \\texttt{...} or clear spacing for code snippets.
- Ensure syntax correctness for all provided algorithms or code logic.`;
    }

    const prompt = `Act as a high-level academic curriculum architect. Generate a JSON array of ${importData.count} MCQ questions for class ${importData.classLevel} students studying ${importData.board || 'Standards'}.
The entire content (questions, options, and explanations) MUST be in ${importData.language === 'bengali' ? 'BENGALI' : 'ENGLISH'} language.
Subject: ${importData.subject}
Topic: ${importData.topic || 'General Concepts'}
Difficulty: ${importData.difficulty}
Weightage: ${importData.marksPerQ} Marks per question
Instruction: ${complexityTxt}
${subjectSpecificRules}

CRITICAL FORMATTING & ACCURACY RULES:
1. Output MUST be a valid JSON array of objects ONLY.
2. NO conversational text, NO intro, NO outro, NO markdown code blocks (NO \`\`\`json).
3. ALL mathematical expressions MUST be wrapped in LaTeX delimiters ($...$ for inline, $$...$$ for block).
4. **JSON ESCAPING**: Use DOUBLE backslashes for all LaTeX commands in the JSON string (e.g., "\\\\frac{a}{b}", "\\\\sin", "\\\\theta").
5. **ELIMINATE POSITION BIAS**: Randomly distribute the correct answer across indices 0, 1, 2, and 3. DO NOT always make the first or second option correct.
6. **DOUBLE-VERIFICATION MANDATE**: You MUST double-check every question and its corresponding answer for 100% accuracy. Perform a secondary mental "Chain of Thought" audit to ensure the "answer" index precisely matches the correct mathematical/scientific solution among the options. 
7. **ZERO TOLERANCE**: No incorrect answers or logical fallacies will be entertained. The solution provided in the "explanation" MUST logically lead to the option at the specified "answer" index.
8. Ensure options are exactly 4 unique, plausible, but distinct strings.
9. The "answer" field MUST be an integer from 0 to 3.
10. The "explanation" should be a clear, tactical breakdown of the correct derivation.

JSON SCHEMA: 
[{"question": "string", "options": ["string", "string", "string", "string"], "answer": integer, "explanation": "string"}]

Return ONLY the raw JSON array. DO NOT WRAP IN MARKDOWN.`;
    
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
      let deadline = undefined;
      if (testData.deadline) {
        const dateObj = new Date(`${testData.deadline}T23:59:59`);
        if (!isNaN(dateObj.getTime())) {
          deadline = dateObj.toISOString();
        } else {
          return alert('Invalid deadline selected');
        }
      }

      // Ensure deadline is sent in ISO format that Zod datetime() expects
      const formattedData = {
        ...testData,
        deadline
      };
      
      await createTest(formattedData);
      setDeploySuccess(true);
      setTimeout(() => {
        alert('Task Deployed Successfully!');
        navigate('/mcq');
      }, 500);
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
          <div className="student-info w-full">
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
        <header className="creator-header mb-16">
          <div className="icon-badge">
            <BookOpen size={32} />
          </div>
          <h1 className="glow-text">Intelligence Uplink Initialized</h1>
          <p className="subtitle">Select your method of curriculum deployment to the designated cohort.</p>
        </header>

        <div className="selection-grid">
          <div className="method-card" onClick={() => setCreationMode('MANUAL')}>
            <div className="icon-wrapper">
              <Plus size={32} />
            </div>
            <h3>Manual Construct</h3>
            <p>Hand-craft each tactical query for maximum precision and control.</p>
            <button className="btn-primary full-width mt-4">Initiate Manual Path</button>
          </div>

          <div className="method-card json-path" onClick={() => setCreationMode('JSON')}>
            <div className="icon-wrapper">
              <BookOpen size={32} />
            </div>
            <h3>Neural Import</h3>
            <p>Deploy large-scale assessments via tactical JSON data structures.</p>
            <button className="btn-primary full-width mt-4 btn-danger-gradient">Initiate Intelligence Uplink</button>
          </div>
        </div>

        <button onClick={() => navigate('/mcq')} className="abort-btn mt-8">
           <X size={18} /> Abort Selection
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
                <div className="input-grid two-cols">
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
                
                <div className="input-grid mixed-cols">
                  <div className="input-group">
                    <label>Topic Name</label>
                    <input 
                      className="glass-input" 
                      placeholder="Mission Topic..."
                      value={importData.topic}
                      onChange={(e) => setImportData({...importData, topic: e.target.value})}
                    />
                  </div>
                  <GlassDropdown 
                    label="Target Class"
                    options={classOptions}
                    value={importData.classLevel}
                    onChange={(val) => setImportData({...importData, classLevel: val})}
                    icon={Target}
                  />
                </div>

                <div className="input-grid three-cols">
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

                <div className="input-grid two-cols">
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
                  <div className="input-group">
                    <label>Max Pauses</label>
                    <input 
                      type="number"
                      className="glass-input" 
                      value={importData.pauseLimit}
                      onChange={(e) => setImportData({...importData, pauseLimit: e.target.value})}
                    />
                  </div>
                </div>

                <div className={`toggle-grid ${importData.hasTimer ? 'three-cols' : ''}`}>
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
                  {importData.hasTimer && (
                    <div className="tactical-toggle mt-2 duration-toggle">
                      <div className="duration-controls">
                        <input 
                          type="number"
                          className="inline-duration-input" 
                          value={importData.duration}
                          onChange={(e) => setImportData({...importData, duration: e.target.value})}
                        />
                        <span className="duration-unit">min</span>
                      </div>
                    </div>
                  )}
                  <div className="tactical-toggle mt-2">
                    <span>Lengthy (JEE Style)</span>
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
                    <button className="btn-generate-prompt full-width active mb-2" onClick={handleAIGenerate} disabled={isGenerating}>
                        {isGenerating ? <><Loader2 className="animate-spin" style={{display:'inline', marginRight:'8px'}} size={16} /> Generating AI Intelligence...</> : 'Generate JSON via AI Co-Pilot'}
                    </button>
                    <button className="btn-generate-prompt full-width" onClick={copyPrompt}>
                        Generate Prompt for AI (Manual)
                    </button>
                    <p className="prompt-help-text mt-2">Metadata synced. Automate or copy strategic prompt.</p>
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
                {testData.hasTimer && (
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
                )}
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
              <div className="input-grid">
                <div className="input-group">
                  <label>Max Pauses Allowed</label>
                  <input 
                    type="number"
                    value={testData.pauseLimit}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTestData({...testData, pauseLimit: isNaN(val) ? 0 : val});
                    }}
                    className="glass-input" 
                    placeholder="0 = No Pauses"
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

                {q.q && (
                  <div className="math-preview-box">
                    <span className="preview-label">Live Preview:</span>
                    <MathRenderer text={q.q} />
                  </div>
                )}

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
                
                {q.explanation && (
                  <div className="math-preview-box explanation">
                    <MathRenderer text={q.explanation} />
                  </div>
                )}
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
                className={`btn-primary ${deploySuccess ? 'success-pulse' : ''}`} 
                onClick={handleCreate}
                disabled={isCreating || deploySuccess}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="animate-spin btn-loader" size={18} />
                    Deploying...
                  </>
                ) : deploySuccess ? 'Task Deployed Successfully!' : 'Finalize and Deploy Task'}
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

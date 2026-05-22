import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSubjectiveStore from '../../store/useSubjectiveStore';
import useUserStore from '../../store/useUserStore';
import { Plus, Trash2, ChevronRight, GraduationCap, BookOpen, Users, Target, X, RefreshCw, AlertCircle, Clock, Zap, Globe, Landmark } from 'lucide-react';
import GlassDropdown from '../../components/ui/GlassDropdown';
import Skeleton from '../../components/ui/Skeleton';
import MathRenderer from '../../components/ui/MathRenderer';
import { generateQA } from '../../services/aiService';
import { Loader2 } from 'lucide-react';


const SubjectiveCreator = () => {
  const navigate = useNavigate();
  const { createTest, isLoading: isCreating } = useSubjectiveStore();
  const { profile, fetchProfile, isLoading: isFetchingProfile } = useUserStore();
  
  const [creationMode, setCreationMode] = useState(null); // null, 'MANUAL', 'JSON'
  const [step, setStep] = useState(1); 
  const [isGenerating, setIsGenerating] = useState(false); 
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

  const difficultyOptions = [
    { value: 'EASY', label: 'Beginner' },
    { value: 'MEDIUM', label: 'Intermediate' },
    { value: 'HARD', label: 'Advanced' }
  ];

  const boardOptions = [
    { value: 'CBSE', label: 'CBSE' },
    { value: 'ICSE', label: 'ICSE / ISC' },
    { value: 'WBCHSE', label: 'WBCHSE / WBBSE' },
    { value: 'STATE', label: 'Other State Board' },
    { value: 'IGCSE', label: 'IGCSE / IB' }
  ];

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'bengali', label: 'Bengali' },
    { value: 'hindi', label: 'Hindi' }
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

  const handleAIGenerate = async () => {
    if (!importData.topic) return alert('Enter a Topic Name for the task.');
    setIsGenerating(true);
    try {
      const response = await generateQA({
        subject: importData.subject,
        topic: importData.topic,
        difficulty: importData.difficulty,
        count: parseInt(importData.count) || 5,
        language: importData.language,
        classLevel: importData.class,
        board: importData.board,
        marksPerQ: parseInt(importData.defaultMarks) || 2,
        type: 'SUBJECTIVE'
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
    if (!importData.topic) return alert('Enter a Topic Name for the task.');
    if (!importData.jsonText) return alert('JSON Data field empty. Systems unresponsive.');

    try {
      let cleanJson = importData.jsonText.trim();
      
      // Self-healing: Remove Markdown block wrappers if AI included them
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
      }

      // PRE-PARSE NORMALIZATION: Detect unescaped backslashes (e.g. \theta)
      let normalizedJson = cleanJson.replace(/\\([a-zA-Z])/g, (match, p1) => {
        return '\\\\' + p1;
      });

      let parsed = null;
      try {
        parsed = JSON.parse(normalizedJson);
      } catch (e) {
        try {
          parsed = JSON.parse(cleanJson);
        } catch (err) {
          try {
            const extremeHeal = cleanJson.replace(/\\/g, '\\\\');
            parsed = JSON.parse(extremeHeal);
          } catch (lastErr) {
             throw new Error('Tactical Malform: JSON parsing failed.');
          }
        }
      }

      if (!Array.isArray(parsed)) throw new Error('Data must be a JSON array.');

      const formattedQs = parsed.map((q, index) => {
        const baseMarks = parseInt(importData.defaultMarks) || 2;
        let text = "";
        if (typeof q === 'string') text = q;
        else text = q.question || q.text || q.q || "";

        if (!text) throw new Error(`Entry ${index + 1} is invalid.`);

        return { text, marks: baseMarks };
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
    let subjectSpecificRules = '';
    const sub = importData.subject;
    if (sub === 'PHYSICS' || sub === 'SCIENCE') {
      subjectSpecificRules = `
PHYSICS/SCIENCE RULES:
- ALL units MUST be in LaTeX (e.g., $m/s^2$, $kg \\cdot m/s$).
- Use scientific notation in LaTeX (e.g., $3 \\times 10^8 m/s$).`;
    } else if (sub === 'CHEMISTRY') {
      subjectSpecificRules = `
CHEMISTRY RULES:
- Use LaTeX for all chemical formulas (e.g., $H_2SO_4$, $Fe^{2+}$).
- Use LaTeX for equilibrium arrows and reactions (e.g., $\\rightarrow$, $\\rightleftharpoons$).`;
    } else if (sub === 'BIOLOGY') {
      subjectSpecificRules = `
BIOLOGY RULES:
- Focus on precise anatomical and physiological terminology.`;
    } else if (sub === 'COMPUTER' || sub === 'CODING') {
      subjectSpecificRules = `
COMPUTING RULES:
- Use LaTeX \\texttt{...} for code snippets or algorithms.`;
    }

    const prompt = `Act as a high-level academic curriculum architect for ${importData.board} board. 
Language: ${importData.language === 'bengali' ? 'BENGALI' : 'ENGLISH'}
Class/Grade: ${importData.class}
Subject: ${importData.subject}
Topic: ${importData.topic || 'General Concepts'}
Difficulty: ${importData.difficulty}
Requirement: Generate a JSON array of ${importData.count} SUBJECTIVE (Long Answer) questions.
${subjectSpecificRules}

CRITICAL FORMATTING & ACCURACY RULES:
1. Output MUST be a valid JSON array of objects ONLY.
2. NO conversational text, NO intro, NO outro, NO markdown code blocks.
3. ALL mathematical expressions MUST be wrapped in LaTeX delimiters ($...$ for inline, $$...$$ for block).
4. **JSON ESCAPING**: Use DOUBLE backslashes for all LaTeX commands in the JSON string (e.g., "\\\\frac{a}{b}", "\\\\sin", "\\\\theta").
5. **DOUBLE-VERIFICATION MANDATE**: You MUST double-check every question for academic accuracy and relevance. Ensure the questions are pedagogically sound and match the specified difficulty.
6. **ZERO TOLERANCE**: No incorrect facts, flawed logic, or grammatical errors will be entertained.
7. Format: Return ONLY a JSON array of objects. Example: [{"text": "Question text with $\\\\frac{a}{b}$ math", "marks": ${importData.defaultMarks}}]`;
    
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
                  <GlassDropdown 
                    label="Target Class"
                    options={classOptions}
                    value={importData.class}
                    onChange={(val) => setImportData({...importData, class: val})}
                    icon={Target}
                  />
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
                    <button className="btn-generate-prompt full-width active mb-2" onClick={handleAIGenerate} disabled={isGenerating}>
                        {isGenerating ? <><Loader2 className="animate-spin" style={{display:'inline', marginRight:'8px'}} size={16} /> Generating AI Intelligence...</> : 'Generate JSON via AI Co-Pilot'}
                    </button>
                    <button className="btn-generate-prompt full-width" onClick={copyPrompt}>
                        Generate Prompt for AI (Manual)
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
                <GlassDropdown 
                  label="Target Class"
                  options={classOptions}
                  value={testData.class}
                  onChange={(val) => setTestData({...testData, class: val})}
                  icon={Target}
                />
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

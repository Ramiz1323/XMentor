import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Plus, Trash2, Save, X, Timer, Users, ChevronRight, GraduationCap, BookOpen } from 'lucide-react';
import GlassDropdown from '../../components/ui/GlassDropdown';

const MCQCreator = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  
  const [testData, setTestData] = useState({
    title: '',
    subject: 'CODING',
    duration: 10,
    hasTimer: true,
    assignedStudents: [],
    questions: [
      { q: '', options: ['', '', '', ''], correct: 0, explanation: '' }
    ]
  });

  const [step, setStep] = useState(1); 

  const subjectOptions = [
    { value: 'MATHS', label: 'Mathematics' },
    { value: 'PHYSICS', label: 'Physics' },
    { value: 'CHEMISTRY', label: 'Chemistry' },
    { value: 'BIOLOGY', label: 'Biology' },
    { value: 'CODING', label: 'Coding' },
    { value: 'OTHERS', label: 'Others' }
  ];

  useState(() => {
    const fetchStudents = async () => {
      try {
        setFetchingStudents(true);
        const { data } = await api.get('/user/profile');
        setStudents(data.data.students || []);
      } catch (err) {
        console.error('Failed to load cohort intel', err);
      } finally {
        setFetchingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  const handleCreate = async () => {
    if (!testData.title) return alert('Task title is required');
    if (testData.questions.some(q => !q.q)) return alert('All questions must have text');
    if (testData.questions.some(q => q.options.some(opt => !opt.trim()))) {
      return alert('All options must be filled before task deployment');
    }
    
    try {
      setLoading(true);
      await api.post('/mcq', testData);
      alert('Task Deployed Successfully!');
      navigate('/mcq-hub');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
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


  return (
    <div className="task-creator-container">
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
            
            {fetchingStudents ? (
              <div className="loader">Analyzing cohort database...</div>
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
              <button className="btn-sec" onClick={() => setStep(2)}>Adjust Intel</button>
              <button 
                className="btn-primary" 
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? 'Deploying...' : 'Finalize and Deploy Task'}
              </button>
            </div>

            <div className="task-summary">
              Targeting {testData.assignedStudents.length} Students • {testData.questions.length} Questions • Subject: {testData.subject}
            </div>
          </div>
        )}
      </div>

      <button onClick={() => navigate('/mcq-hub')} className="abort-btn">
        <X size={16} /> Abort Task Operation
      </button>
    </div>
  );
};

export default MCQCreator;

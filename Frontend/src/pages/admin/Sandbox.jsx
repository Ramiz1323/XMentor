import { useState, useEffect } from 'react';
import { Settings, Play, CheckCircle, AlertTriangle, Type, List, FileCode, CheckSquare, MessageSquare, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import MathRenderer from '../../components/ui/MathRenderer';
import GlassDropdown from '../../components/ui/GlassDropdown';

const Sandbox = () => {
  const [formatType, setFormatType] = useState('MCQ'); // 'MCQ' or 'SUBJECTIVE'
  const [rawJson, setRawJson] = useState('[\n  {\n    "question": "Sample Question?",\n    "options": ["A", "B", "C", "D"],\n    "answer": 0,\n    "explanation": "Explanation here"\n  }\n]');
  const [parsedJson, setParsedJson] = useState(null);
  const [error, setError] = useState('');
  const [showPromptGen, setShowPromptGen] = useState(false);

  const [importData, setImportData] = useState({
    subject: 'CODING',
    topic: 'Basic Variables',
    difficulty: 'MEDIUM',
    count: 5,
    board: 'CBSE',
    classLevel: '12',
    marksPerQ: 4,
    isLengthy: false,
    language: 'english'
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
    { value: '5', label: 'Class 5' }, { value: '6', label: 'Class 6' },
    { value: '7', label: 'Class 7' }, { value: '8', label: 'Class 8' },
    { value: '9', label: 'Class 9' }, { value: '10', label: 'Class 10' },
    { value: '11', label: 'Class 11' }, { value: '12', label: 'Class 12' },
    { value: 'UG', label: 'Undergraduate' }, { value: 'PG', label: 'Postgraduate' }
  ];

  const subjectOptions = [
    { value: 'MATHS', label: 'Mathematics' }, { value: 'SCIENCE', label: 'General Science' },
    { value: 'PHYSICS', label: 'Physics' }, { value: 'CHEMISTRY', label: 'Chemistry' },
    { value: 'BIOLOGY', label: 'Biology' }, { value: 'HISTORY', label: 'History' },
    { value: 'GEOGRAPHY', label: 'Geography' }, { value: 'ENGLISH', label: 'English' },
    { value: 'BENGALI', label: 'Bengali' }, { value: 'COMPUTER', label: 'Computer Science' },
    { value: 'CODING', label: 'Coding' }, { value: 'OTHERS', label: 'Others' }
  ];
  
  const languageOptions = [
    { value: 'english', label: 'English' }, { value: 'bengali', label: 'Bengali' }
  ];

  // Re-parse whenever rawJson or formatType changes
  useEffect(() => {
    try {
      if (!rawJson.trim()) {
        setParsedJson([]);
        setError('');
        return;
      }
      let cleanJson = rawJson.trim();
      
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
      }

      cleanJson = cleanJson.replace(/""([^"]+)""/g, '"\\"$1\\""');
      cleanJson = cleanJson.replace(/[\r\n]+/g, ' ');

      let normalizedJson = cleanJson.replace(/\\+([^"])/g, (match, p1) => {
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
             throw new Error('JSON parsing failed. Invalid syntax.');
          }
        }
      }

      if (!Array.isArray(parsed)) {
        throw new Error('Root level must be a JSON Array [ ]');
      }
      setParsedJson(parsed);
      setError('');
    } catch (err) {
      setError(err.message);
      setParsedJson(null);
    }
  }, [rawJson, formatType]);

  const handleFormatSwitch = (type) => {
    setFormatType(type);
    if (type === 'MCQ') {
      setRawJson('[\n  {\n    "question": "Sample MCQ Question?",\n    "options": ["Option A", "Option B", "Option C", "Option D"],\n    "answer": 0,\n    "explanation": "Explanation here"\n  }\n]');
    } else {
      setRawJson('[\n  {\n    "type": "SHORT_ANSWER",\n    "question": "Explain this concept briefly.",\n    "suggestedAnswer": "Key points..."\n  },\n  {\n    "type": "LONG_ANSWER",\n    "question": "Describe this in detail.",\n    "suggestedAnswer": "Detailed explanation..."\n  }\n]');
    }
  };

  const handleCopyPrompt = () => {
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
    } else if (sub === 'COMPUTER' || sub === 'CODING' || sub === 'IT') {
      subjectSpecificRules = `
COMPUTING RULES:
- You MUST wrap ALL code snippets (even single-line ones) in TRIPLE markdown backticks with the language specified (e.g., \\n\\n\`\`\`javascript\\nconsole.log(1);\\n\`\`\`\\n\\n).
- NEVER use single backticks for code blocks.
- CRITICAL: You MUST use the escaped literal '\\n' for ALL line breaks inside the code block. DO NOT use physical newlines.`;
    }

    let prompt = '';
    
    if (formatType === 'MCQ') {
      const complexityTxt = importData.isLengthy 
        ? 'Focus on lengthy, multi-step calculative and theory based problems where students need to solve on paper before selecting the option.' 
        : 'Focus on conceptual clarity and rapid theoretical analysis.';

      prompt = `Act as a high-level academic curriculum architect. Generate a JSON array of ${importData.count} MCQ questions for class ${importData.classLevel} students studying ${importData.board || 'Standards'}.
The entire content MUST be in ${importData.language === 'bengali' ? 'BENGALI' : 'ENGLISH'} language.
Subject: ${importData.subject}
Topic: ${importData.topic || 'General Concepts'}
Difficulty: ${importData.difficulty}
Weightage: ${importData.marksPerQ} Marks per question
Instruction: ${complexityTxt}
${subjectSpecificRules}

CRITICAL FORMATTING & ACCURACY RULES:
1. Output MUST be a strictly valid JSON array of objects ONLY. If you need to quote text inside a string value, use single quotes (e.g., 'example'). DO NOT wrap the entire string value in single quotes. NEVER use unescaped double quotes inside strings.
2. NO conversational text, NO intro, NO outro. DO NOT use physical newlines inside strings. If a newline is needed, use the escaped literal '\\n'.
3. ALL mathematical expressions MUST be wrapped in LaTeX delimiters ($...$ for inline, $$...$$ for block). Ensure brackets are properly paired (e.g., \\left( MUST be closed with \\right), NEVER use \\) to close it).
4. **CRITICAL JSON ESCAPING**: Use standard LaTeX notation (e.g., \\frac, \\times, \\sqrt, \\pi). Do not double escape backslashes; the system will automatically parse and escape them.
5. JSON SCHEMA: [{"question": "string", "options": ["string", "string", "string", "string"], "answer": integer, "explanation": "string"}]
Return ONLY the raw JSON array. DO NOT WRAP IN MARKDOWN.`;

    } else {
      prompt = `Act as a high-level academic curriculum architect for ${importData.board} board. 
Language: ${importData.language === 'bengali' ? 'BENGALI' : 'ENGLISH'}
Class/Grade: ${importData.classLevel}
Subject: ${importData.subject}
Topic: ${importData.topic || 'General Concepts'}
Difficulty: ${importData.difficulty}
Requirement: Generate a JSON array of ${importData.count} SUBJECTIVE (Long Answer) questions.
${subjectSpecificRules}

CRITICAL FORMATTING & ACCURACY RULES:
1. Output MUST be a strictly valid JSON array of objects ONLY. If you need to quote text inside a string value, use single quotes (e.g., 'example'). DO NOT wrap the entire string value in single quotes. NEVER use unescaped double quotes inside strings.
2. NO conversational text, NO intro, NO outro. DO NOT use physical newlines inside strings. If a newline is needed, use the escaped literal '\\n'.
3. ALL mathematical expressions MUST be wrapped in LaTeX delimiters ($...$ for inline, $$...$$ for block). Ensure brackets are properly paired (e.g., \\left( MUST be closed with \\right), NEVER use \\) to close it).
4. **CRITICAL JSON ESCAPING**: Use standard LaTeX notation (e.g., \\frac, \\times, \\sqrt, \\pi). Do not double escape backslashes; the system will automatically parse and escape them.
5. JSON SCHEMA: [{"type": "SHORT_ANSWER | LONG_ANSWER", "question": "string", "suggestedAnswer": "string"}]
Return ONLY the raw JSON array. DO NOT WRAP IN MARKDOWN.`;
    }
    
    navigator.clipboard.writeText(prompt);
    alert('AI Prompt Copied! Paste this into Gemini/ChatGPT to generate perfectly formatted JSON.');
  };

  return (
    <div className="sandbox-container animate-fade-in">
      <div className="sandbox-header">
        <div className="header-title">
          <FileCode className="text-accent" size={28} />
          <h1>Format Sandbox</h1>
        </div>
        <p>Test and preview AI-generated JSON formats instantly</p>
      </div>

      <div className="sandbox-controls glass-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="format-toggles">
            <button 
              className={`toggle-btn ${formatType === 'MCQ' ? 'active' : ''}`}
              onClick={() => handleFormatSwitch('MCQ')}
            >
              <CheckSquare size={16} /> MCQ Format
            </button>
            <button 
              className={`toggle-btn ${formatType === 'SUBJECTIVE' ? 'active' : ''}`}
              onClick={() => handleFormatSwitch('SUBJECTIVE')}
            >
              <MessageSquare size={16} /> Subjective Format
            </button>
          </div>
          <button 
            className="btn-sec btn-small flex-row gap-2"
            onClick={() => setShowPromptGen(!showPromptGen)}
          >
            <Settings size={14} /> 
            {showPromptGen ? 'Hide Settings' : 'Prompt Generator Settings'}
          </button>
        </div>

        {showPromptGen && (
          <div className="prompt-gen-form animate-slide-up" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="input-group">
              <label>Subject</label>
              <GlassDropdown options={subjectOptions} value={importData.subject} onChange={(v) => setImportData({...importData, subject: v})} />
            </div>
            <div className="input-group">
              <label>Topic / Chapter</label>
              <input type="text" className="glass-input" value={importData.topic} onChange={(e) => setImportData({...importData, topic: e.target.value})} placeholder="e.g. Electromagnetism" />
            </div>
            <div className="input-group">
              <label>Class Level</label>
              <GlassDropdown options={classOptions} value={importData.classLevel} onChange={(v) => setImportData({...importData, classLevel: v})} />
            </div>
            <div className="input-group">
              <label>Difficulty</label>
              <GlassDropdown options={difficultyOptions} value={importData.difficulty} onChange={(v) => setImportData({...importData, difficulty: v})} />
            </div>
            <div className="input-group">
              <label>Board</label>
              <GlassDropdown options={boardOptions} value={importData.board} onChange={(v) => setImportData({...importData, board: v})} />
            </div>
            <div className="input-group">
              <label>Language</label>
              <GlassDropdown options={languageOptions} value={importData.language} onChange={(v) => setImportData({...importData, language: v})} />
            </div>
            <div className="input-group">
              <label>Question Count</label>
              <input type="number" className="glass-input" value={importData.count} onChange={(e) => setImportData({...importData, count: e.target.value})} min="1" max="50" />
            </div>
          </div>
        )}
      </div>

      <div className="sandbox-workspace">
        {/* LEFT PANE: Editor */}
        <div className="sandbox-pane editor-pane glass-card">
          <div className="pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h3><Type size={16} /> Raw JSON Input</h3>
              {error ? (
                <span className="status error" style={{ color: '#ef4444', fontSize: '0.8rem' }}><AlertTriangle size={14} style={{ display: 'inline', marginBottom: '-2px' }}/> Error</span>
              ) : (
                <span className="status success" style={{ color: '#22c55e', fontSize: '0.8rem' }}><CheckCircle size={14} style={{ display: 'inline', marginBottom: '-2px' }}/> Valid</span>
              )}
            </div>
            <button onClick={handleCopyPrompt} className="btn-primary btn-small flex-row gap-2" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', boxShadow: '0 0 10px rgba(0,255,100,0.2)' }}>
              <Copy size={14} /> Copy Configured Prompt
            </button>
          </div>
          <textarea 
            className="json-editor glass-input"
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            spellCheck="false"
            placeholder="Paste your AI generated JSON here..."
          />
        </div>

        {/* RIGHT PANE: Preview */}
        <div className="sandbox-pane preview-pane glass-card">
          <div className="pane-header">
            <h3><Play size={16} /> Render Preview</h3>
          </div>
          
          <div className="preview-content">
            {error && (
              <div className="error-box">
                <AlertTriangle size={24} className="text-danger" />
                <h4>Syntax Error</h4>
                <p>{error}</p>
                <div className="error-hint">Check for missing commas, unescaped quotes, or invalid LaTeX escaping.</div>
              </div>
            )}

            {!error && parsedJson && parsedJson.length === 0 && (
              <div className="empty-preview">
                <List size={32} />
                <p>Waiting for input...</p>
              </div>
            )}

            {!error && parsedJson && parsedJson.length > 0 && formatType === 'MCQ' && (
              <div className="mcq-preview-list">
                {parsedJson.map((q, idx) => (
                  <div key={idx} className="mcq-preview-card">
                    <div className="q-header">
                      <span className="q-number">Q{idx + 1}</span>
                      <div className="q-text">
                        {q.question ? <MathRenderer text={q.question} /> : <span className="text-danger">Missing "question" field</span>}
                      </div>
                    </div>
                    <div className="q-options">
                      {Array.isArray(q.options) ? q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`q-option ${q.answer === oIdx ? 'correct' : ''}`}>
                          <span className="opt-letter">{String.fromCharCode(65 + oIdx)}</span>
                          <div className="opt-text">
                            <MathRenderer text={opt} />
                          </div>
                          {q.answer === oIdx && <CheckCircle size={16} className="text-success" />}
                        </div>
                      )) : <span className="text-danger">Missing or invalid "options" array</span>}
                    </div>
                    {q.explanation && (
                      <div className="q-explanation">
                        <strong>Explanation:</strong> <MathRenderer text={q.explanation} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!error && parsedJson && parsedJson.length > 0 && formatType === 'SUBJECTIVE' && (
              <div className="subj-preview-list">
                {parsedJson.map((q, idx) => (
                  <div key={idx} className="subj-preview-card">
                    <div className="subj-header">
                      <span className="q-number">Q{idx + 1}</span>
                      <span className="q-type-badge">{q.type || 'UNKNOWN TYPE'}</span>
                    </div>
                    <div className="subj-question">
                      {q.question ? <MathRenderer text={q.question} /> : <span className="text-danger">Missing "question" field</span>}
                    </div>
                    {q.suggestedAnswer && (
                      <div className="subj-answer">
                        <strong>Suggested Answer:</strong>
                        <MathRenderer text={q.suggestedAnswer} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sandbox;

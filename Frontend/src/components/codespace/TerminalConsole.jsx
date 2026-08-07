import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Terminal, Trash2, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const TerminalConsole = ({ result, isRunning, onClear, inputsList, onSubmitInput }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const terminalBodyRef = useRef(null);

  const rawStdout = result?.output || '';
  const rawStderr = result?.stderr || '';
  const isNoSuchElementErr = rawStderr.includes('NoSuchElementException') || rawStderr.includes('InputMismatchException');

  // Auto-focus prompt input when terminal mounts, result updates, or execution finishes
  useEffect(() => {
    if (!isRunning && isNoSuchElementErr && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRunning, result, isNoSuchElementErr]);

  // Auto-scroll terminal to bottom when new content or prompt is rendered
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [result, isRunning, inputsList, inputValue]);

  // Focus input when user clicks anywhere in the terminal body
  const handleBodyClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const textToSubmit = inputValue.trim();
      setInputValue('');
      onSubmitInput(textToSubmit);
    }
  }, [inputValue, onSubmitInput]);

  // Memoized terminal stream data to avoid string re-splitting on input changes
  const { promptStdout, resultStdout } = useMemo(() => {
    if (!result) return { promptStdout: [], resultStdout: [] };

    const stdoutLines = rawStdout ? rawStdout.split('\n').filter(line => line.trim() !== '') : [];
    let pStdout = [];
    let rStdout = [];

    if (isNoSuchElementErr || inputsList.length === 0) {
      pStdout = stdoutLines;
    } else {
      if (stdoutLines.length > 0) {
        pStdout = [stdoutLines[0]];
        rStdout = stdoutLines.slice(1);
      }
    }

    return { promptStdout: pStdout, resultStdout: rStdout };
  }, [result, rawStdout, isNoSuchElementErr, inputsList.length]);

  // Helper to format output lines interleaved with user inputs like VS Code Terminal
  const renderTerminalContent = useCallback(() => {
    if (!result) return null;

    return (
      <div className="terminal-stream">
        {/* Initial Prompt Output from Code (e.g. "Enter the size of the array") */}
        {promptStdout.map((line, idx) => (
          <div key={`prompt-${idx}`} className="terminal-line stdout">
            {line}
          </div>
        ))}

        {/* Interleaved User Inputs typed in Terminal */}
        {inputsList.map((inp, idx) => (
          <div key={`input-${idx}`} className="terminal-line stdin">
            <span className="prompt-symbol">❯ </span>
            <span className="user-input-text">{inp}</span>
          </div>
        ))}

        {/* Final Result Outputs from Code (e.g. "50", "40") */}
        {resultStdout.map((line, idx) => (
          <div key={`result-${idx}`} className="terminal-line stdout">
            {line}
          </div>
        ))}

        {/* Error stderr output (if compilation error or crash, excluding expected EOF Scanner error) */}
        {rawStderr && !isNoSuchElementErr && (
          <div className="terminal-line stderr">
            <pre>{rawStderr}</pre>
          </div>
        )}

        {/* Exit Status summary when process completes */}
        {result && !isNoSuchElementErr && (
          <div className={`process-exit-line ${result.success ? 'success' : 'error'}`}>
            [Process finished with exit code {result.exitCode}]
          </div>
        )}
      </div>
    );
  }, [result, isNoSuchElementErr, promptStdout, inputsList, resultStdout, rawStderr]);

  return (
    <div className="terminal-console-wrapper" onClick={handleBodyClick}>
      {/* Terminal Header */}
      <div className="terminal-header" onClick={(e) => e.stopPropagation()}>
        <div className="terminal-title">
          <Terminal size={16} />
          <span>Output Terminal</span>
        </div>
        <div className="terminal-actions">
          {isRunning && (
            <span className="status-badge running">
              <Loader2 size={13} className="spin" /> Running...
            </span>
          )}
          {result && !isRunning && (
            <span className={`status-badge ${result.success ? 'success' : 'error'}`}>
              {result.success ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
              {result.success ? 'Success' : `Failed (${result.exitCode})`}
            </span>
          )}
          <button className="clear-btn" onClick={onClear} title="Clear Terminal Window">
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="terminal-body" ref={terminalBodyRef}>
        {isRunning && (!result || inputsList.length === 0) ? (
          <div className="terminal-placeholder running">
            <Loader2 size={24} className="spin" />
            <p>Compiling and executing Java program...</p>
          </div>
        ) : !result && inputsList.length === 0 ? (
          <div className="terminal-placeholder">
            <p>Click <strong>Run Java ▶</strong> to execute your program in the terminal.</p>
          </div>
        ) : (
          renderTerminalContent()
        )}

        {/* Interactive VS Code Terminal Prompt Line - Only shown when program is actively waiting for Scanner/stdin input */}
        {!isRunning && result && isNoSuchElementErr && (
          <div className="terminal-prompt-row">
            <span className="prompt-symbol">❯ </span>
            <input
              ref={inputRef}
              type="text"
              className="terminal-interactive-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type input and press Enter..."
              spellCheck="false"
              autoComplete="off"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalConsole;

import React from 'react';
import { Terminal, Trash2, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const TerminalConsole = ({ result, isRunning, onClear }) => {
  return (
    <div className="terminal-console-wrapper">
      <div className="terminal-header">
        <div className="terminal-title">
          <Terminal size={16} />
          <span>Output Terminal</span>
        </div>
        <div className="terminal-actions">
          {isRunning && (
            <span className="status-badge running">
              <Loader2 size={13} className="spin" /> Executing Java...
            </span>
          )}
          {result && !isRunning && (
            <span className={`status-badge ${result.success ? 'success' : 'error'}`}>
              {result.success ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
              {result.success ? 'Success' : `Failed (exit code ${result.exitCode})`}
            </span>
          )}
          <button className="clear-btn" onClick={onClear} title="Clear Terminal">
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>
      <div className="terminal-body">
        {isRunning ? (
          <div className="terminal-placeholder running">
            <Loader2 size={24} className="spin" />
            <p>Compiling and running Java code via Piston Engine...</p>
          </div>
        ) : !result ? (
          <div className="terminal-placeholder">
            <p>Click <strong>Run Java ▶</strong> to execute your code.</p>
          </div>
        ) : (
          <div className="terminal-output">
            {result.output && (
              <pre className="stdout-text">{result.output}</pre>
            )}
            {result.stderr && (
              <pre className="stderr-text">{result.stderr}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalConsole;

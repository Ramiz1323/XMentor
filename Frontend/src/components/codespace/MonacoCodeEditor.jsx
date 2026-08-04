import React from 'react';
import Editor from '@monaco-editor/react';

const MonacoCodeEditor = ({ language, value, onChange, theme = 'vs-dark' }) => {
  const getMonacoLanguage = (lang) => {
    switch (lang?.toLowerCase()) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'js':
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      default: return 'javascript';
    }
  };

  return (
    <div className="monaco-editor-wrapper">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        theme={theme}
        value={value}
        onChange={onChange}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, Monaco, monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          padding: { top: 12, bottom: 12 },
          lineNumbersMinChars: 3,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          tabSize: 2,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
};

export default MonacoCodeEditor;

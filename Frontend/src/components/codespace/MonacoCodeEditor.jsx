import React from 'react';
import Editor, { loader } from '@monaco-editor/react';

// Configure Monaco Loader CDN to ensure full language services (IntelliSense, Autocomplete, HTML/CSS/JS/Java validation)
loader.config({
  paths: {
    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs',
  },
});

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

  const handleEditorWillMount = (monaco) => {
    // Configure JavaScript / TypeScript compiler options for rich autocompletion
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      allowJs: true,
      checkJs: true,
    });
    
    // Enable HTML & CSS suggestion triggers
    monaco.languages.html?.htmlDefaults?.setOptions({
      suggest: { html5: true },
    });
  };

  return (
    <div className="monaco-editor-wrapper">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        theme={theme}
        value={value}
        onChange={onChange}
        beforeMount={handleEditorWillMount}
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

          // ── IntelliSense & Autocomplete Configuration ──
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true,
          },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'on',
          tabCompletion: 'on',
          wordBasedSuggestions: 'allDocuments',
          snippetSuggestions: 'inline',
          suggest: {
            insertMode: 'insert',
            filterGraceful: true,
            showKeywords: true,
            showSnippets: true,
            showFunctions: true,
            showVariables: true,
            showClasses: true,
            showMethods: true,
            showProperties: true,
            showEvents: true,
            showOperators: true,
            showUnits: true,
            showValues: true,
            showConstants: true,
            showEnums: true,
            showEnumMembers: true,
            showStructs: true,
            showInterfaces: true,
            showTypeParameters: true,
          },
        }}
      />
    </div>
  );
};

export default MonacoCodeEditor;

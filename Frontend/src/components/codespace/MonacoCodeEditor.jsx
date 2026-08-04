import React from 'react';
import Editor, { loader } from '@monaco-editor/react';

// Configure Monaco Loader CDN to ensure full language services
loader.config({
  paths: {
    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs',
  },
});

let providersRegistered = false;

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
    // Configure JavaScript compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      allowJs: true,
      checkJs: true,
    });

    if (providersRegistered) return;
    providersRegistered = true;

    // ── 1. HTML Snippets & Emmet-like Tag Completions ──
    const htmlTags = [
      { label: 'h1', insert: '<h1>$1</h1>', detail: 'Heading 1 Tag' },
      { label: 'h2', insert: '<h2>$1</h2>', detail: 'Heading 2 Tag' },
      { label: 'h3', insert: '<h3>$1</h3>', detail: 'Heading 3 Tag' },
      { label: 'h4', insert: '<h4>$1</h4>', detail: 'Heading 4 Tag' },
      { label: 'p', insert: '<p>$1</p>', detail: 'Paragraph Tag' },
      { label: 'div', insert: '<div class="$1">\n  $2\n</div>', detail: 'Division Container Tag' },
      { label: 'span', insert: '<span>$1</span>', detail: 'Inline Span Tag' },
      { label: 'button', insert: '<button id="$1">$2</button>', detail: 'Button Tag' },
      { label: 'input', insert: '<input type="${1:text}" placeholder="$2" />', detail: 'Input Field Tag' },
      { label: 'a', insert: '<a href="${1:#}">$2</a>', detail: 'Anchor Link Tag' },
      { label: 'img', insert: '<img src="$1" alt="$2" />', detail: 'Image Tag' },
      { label: 'ul', insert: '<ul>\n  <li>$1</li>\n</ul>', detail: 'Unordered List' },
      { label: 'ol', insert: '<ol>\n  <li>$1</li>\n</ol>', detail: 'Ordered List' },
      { label: 'li', insert: '<li>$1</li>', detail: 'List Item' },
      { label: 'form', insert: '<form action="$1">\n  $2\n</form>', detail: 'HTML Form' },
      { label: 'table', insert: '<table>\n  <tr>\n    <th>$1</th>\n  </tr>\n  <tr>\n    <td>$2</td>\n  </tr>\n</table>', detail: 'HTML Table' },
      { label: 'script', insert: '<script>\n  $1\n</script>', detail: 'Script Tag' },
      { label: 'style', insert: '<style>\n  $1\n</style>', detail: 'Style Tag' },
      { label: 'html5', insert: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>${1:Document}</title>\n</head>\n<body>\n  $2\n</body>\n</html>', detail: 'HTML5 Boilerplate' }
    ];

    monaco.languages.registerCompletionItemProvider('html', {
      triggerCharacters: ['<', 'h', 'd', 'p', 'b', 'i', 'a', 'u', 'o', 'l', 'f', 's', '!'],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = htmlTags.map(tag => ({
          label: tag.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: tag.insert,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: tag.detail,
          range: range
        }));

        return { suggestions };
      }
    });

    // ── 2. Java Completions & Snippets ──
    const javaSnippets = [
      { label: 'sout', insert: 'System.out.println($1);', detail: 'Print to Console' },
      { label: 'sysout', insert: 'System.out.println($1);', detail: 'Print to Console' },
      { label: 'psvm', insert: 'public static void main(String[] args) {\n    $1\n}', detail: 'Main Method Signature' },
      { label: 'main', insert: 'public static void main(String[] args) {\n    $1\n}', detail: 'Main Method Signature' },
      { label: 'class', insert: 'public class ${1:Main} {\n    public static void main(String[] args) {\n        $2\n    }\n}', detail: 'Java Public Class' },
      { label: 'for', insert: 'for (int i = 0; i < ${1:10}; i++) {\n    $2\n}', detail: 'For Loop' },
      { label: 'if', insert: 'if (${1:condition}) {\n    $2\n}', detail: 'If Statement' },
      { label: 'ifelse', insert: 'if (${1:condition}) {\n    $2\n} else {\n    $3\n}', detail: 'If-Else Statement' },
      { label: 'scanner', insert: 'Scanner sc = new Scanner(System.in);\nint num = sc.nextInt();', detail: 'Scanner Input Reader' }
    ];

    monaco.languages.registerCompletionItemProvider('java', {
      triggerCharacters: ['s', 'p', 'm', 'c', 'f', 'i', 'S'],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = javaSnippets.map(snippet => ({
          label: snippet.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: snippet.insert,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: snippet.detail,
          range: range
        }));

        return { suggestions };
      }
    });

    // ── 3. JavaScript Completions & Snippets ──
    const jsSnippets = [
      { label: 'clg', insert: 'console.log($1);', detail: 'Console Log' },
      { label: 'log', insert: 'console.log($1);', detail: 'Console Log' },
      { label: 'doc', insert: 'document.getElementById(\'$1\');', detail: 'Get Element By ID' },
      { label: 'qs', insert: 'document.querySelector(\'$1\');', detail: 'Query Selector' },
      { label: 'qsa', insert: 'document.querySelectorAll(\'$1\');', detail: 'Query Selector All' },
      { label: 'fun', insert: 'function ${1:functionName}($2) {\n  $3\n}', detail: 'Function Declaration' },
      { label: 'ael', insert: 'addEventListener(\'${1:click}\', (e) => {\n  $2\n});', detail: 'Add Event Listener' }
    ];

    monaco.languages.registerCompletionItemProvider('javascript', {
      triggerCharacters: ['c', 'l', 'd', 'q', 'f', 'a'],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = jsSnippets.map(snippet => ({
          label: snippet.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: snippet.insert,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: snippet.detail,
          range: range
        }));

        return { suggestions };
      }
    });

    // ── 4. CSS Snippets ──
    const cssSnippets = [
      { label: 'flex', insert: 'display: flex;\njustify-content: center;\nalign-items: center;', detail: 'Flexbox Centering' },
      { label: 'grid', insert: 'display: grid;\ngrid-template-columns: repeat(${1:3}, 1fr);\ngap: ${2:1rem};', detail: 'CSS Grid Layout' },
      { label: 'glass', insert: 'background: rgba(255, 255, 255, 0.1);\nbackdrop-filter: blur(16px);\nborder: 1px solid rgba(255, 255, 255, 0.2);\nborder-radius: 12px;', detail: 'Glassmorphism Style' }
    ];

    monaco.languages.registerCompletionItemProvider('css', {
      triggerCharacters: ['f', 'g', 'd'],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = cssSnippets.map(snippet => ({
          label: snippet.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: snippet.insert,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: snippet.detail,
          range: range
        }));

        return { suggestions };
      }
    });
  };

  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 640;

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
          fontSize: isMobileScreen ? 13 : 14,
          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, Monaco, monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          padding: { top: isMobileScreen ? 8 : 12, bottom: isMobileScreen ? 8 : 12 },
          lineNumbersMinChars: isMobileScreen ? 2 : 3,
          glyphMargin: !isMobileScreen,
          folding: !isMobileScreen,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          tabSize: 2,
          wordWrap: 'on',
          wrappingStrategy: 'advanced',
          wrappingIndent: 'indent',
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
          snippetSuggestions: 'top',
          suggest: {
            insertMode: 'insert',
            filterGraceful: true,
            showSnippets: true,
            showKeywords: true,
            showFunctions: true,
            showVariables: true,
            showClasses: true,
            showMethods: true,
            showProperties: true,
          },
        }}
      />
    </div>
  );
};

export default MonacoCodeEditor;

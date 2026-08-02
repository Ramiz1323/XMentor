import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Code } from 'lucide-react';

const CodeSnippet = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-snippet-container">
      <div className="code-header">
        <div className="language-info">
          <Code size={16} />
          <span>{language || 'Code Snippet'}</span>
        </div>
        <button 
          className={`copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy code"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      
      <div className="code-body">
        <SyntaxHighlighter 
          language={language || 'javascript'} 
          style={vscDarkPlus}
          showLineNumbers={true}
          lineNumberStyle={{ 
            minWidth: '3em', 
            paddingRight: '1em', 
            color: '#6b7280', 
            textAlign: 'right', 
            borderRight: '1px solid rgba(255,255,255,0.1)', 
            marginRight: '1em' 
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeSnippet;

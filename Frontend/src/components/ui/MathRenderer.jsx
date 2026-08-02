import React, { useEffect, useState } from 'react';
import CodeSnippet from './CodeSnippet';

const MathRenderer = ({ text, className = "" }) => {
  const renderMathContent = (content) => {
    if (!content) return "";
    if (!window.katex) return content;

    try {
      let html = content;

      // 1. Pre-process: Handle double backslashes that might have survived JSON parsing
      html = html.replace(/\\\\([a-zA-Z])/g, '\\$1');

      // 2. Handle Block Math: $$ ... $$
      html = html.replace(/\$\$(.*?)\$\$/gs, (match, formula) => {
        try {
          return `<div class="math-block">${window.katex.renderToString(formula, { displayMode: true, throwOnError: false })}</div>`;
        } catch (e) { 
          console.error("KaTeX Block Error:", e);
          return match; 
        }
      });

      // 3. Handle Block Math: \[ ... \]
      html = html.replace(/\\\[(.*?)\\\]/gs, (match, formula) => {
        try {
          return `<div class="math-block">${window.katex.renderToString(formula, { displayMode: true, throwOnError: false })}</div>`;
        } catch (e) { return match; }
      });

      // 4. Handle Inline Math: $ ... $
      html = html.replace(/\$(.*?)\$/g, (match, formula) => {
        try {
          if (formula.trim().length === 0) return match;
          return `<span class="math-inline">${window.katex.renderToString(formula, { displayMode: false, throwOnError: false })}</span>`;
        } catch (e) { 
          console.error("KaTeX Inline Error:", e);
          return match; 
        }
      });

      // 5. Handle Inline Math: \( ... \)
      html = html.replace(/\\\((.*?)\\\)/g, (match, formula) => {
        try {
          return `<span class="math-inline">${window.katex.renderToString(formula, { displayMode: false, throwOnError: false })}</span>`;
        } catch (e) { return match; }
      });

      // 6. Handle inline code: `code`
      html = html.replace(/`([^`]+)`/g, (match, code) => {
        return `<code class="inline-code" style="background: rgba(255,255,255,0.1); padding: 0.15rem 0.3rem; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #e5e7eb;">${code}</code>`;
      });

      return html;
    } catch (err) {
      console.error("Global Math rendering error:", err);
      return content;
    }
  };

  const [elements, setElements] = useState([]);

  useEffect(() => {
    const updateElements = () => {
      if (!text) {
        setElements([]);
        return;
      }
      // Normalize literal '\n' to actual newlines (handling possible double escaping)
      let normalizedText = text.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
      
      // Auto-heal AI mistakes where it uses single backticks with a language name
      normalizedText = normalizedText.replace(/`([a-zA-Z]+)([\s\S]+?)`/g, (match, lang, codeContent) => {
         const validLangs = ['javascript', 'js', 'python', 'py', 'java', 'cpp', 'c', 'html', 'css', 'ruby', 'sql', 'bash', 'text', 'typescript', 'ts'];
         if (validLangs.includes(lang.toLowerCase())) {
            let cleanCode = codeContent;
            // Clean up AI hallucinations like `javascript\text`
            if (cleanCode.startsWith('\\text')) cleanCode = cleanCode.substring(5);
            return `\`\`\`${lang}\n${cleanCode.trim()}\n\`\`\``;
         }
         return match;
      });
      
      // Split text by markdown code blocks: ```language \n code \n ```
      // Made robust to handle cases where AI forgets newlines or adds spaces
      const parts = normalizedText.split(/(```[\s\S]*?```)/g);
      
      const newElements = parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.split('\n');
          // If there's only one line, the AI didn't format with newlines properly
          if (lines.length <= 1) {
             const codeMatch = part.match(/```([\w]*)\s*([\s\S]*?)```/);
             if (codeMatch) {
               return <CodeSnippet key={index} language={codeMatch[1] || 'javascript'} code={codeMatch[2].trim()} />;
             }
             return <span key={index}>{part}</span>;
          }
          const firstLine = lines[0];
          const language = firstLine.replace(/```/g, '').trim() || 'javascript';
          // Ensure we don't include the last line with ``` in the code body
          const code = lines.slice(1, lines.length > 1 && lines[lines.length - 1].trim() === '```' ? -1 : undefined).join('\n');
          
          return <CodeSnippet key={index} language={language} code={code.replace(/```$/, '').trim()} />;
        } else {
          // Standard text/math
          const html = renderMathContent(part);
          // Only wrap in span if there is content to avoid empty spans
          return part.trim() ? (
            <span 
              key={index} 
              dangerouslySetInnerHTML={{ __html: html }} 
            />
          ) : <span key={index}>{part}</span>;
        }
      });
      
      setElements(newElements);
    };

    updateElements();
    
    // Polling for KaTeX
    if (!window.katex) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.katex) {
          updateElements();
          clearInterval(interval);
        }
        if (attempts > 20) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [text]);

  return (
    <div className={`math-rendered-content ${className}`}>
      {elements}
    </div>
  );
};

export default MathRenderer;

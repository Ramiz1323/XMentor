import React, { useEffect, useState, useMemo } from 'react';

const MathRenderer = ({ text, className = "" }) => {
  const renderMathContent = (content) => {
    if (!content) return "";
    if (!window.katex) return content;

    try {
      let html = content;

      // 1. Pre-process: Handle double backslashes that might have survived JSON parsing
      // This is a common issue with AI-generated LaTeX in JSON
      // We only fix it if we see things like \\frac or \\sin
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

      return html;
    } catch (err) {
      console.error("Global Math rendering error:", err);
      return content;
    }
  };

  const [renderedHTML, setRenderedHTML] = useState(text);

  useEffect(() => {
    const updateHTML = () => {
      const result = renderMathContent(text);
      setRenderedHTML(result);
    };

    updateHTML();
    
    // Polling for KaTeX with a longer duration and better check
    if (!window.katex) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.katex) {
          updateHTML();
          clearInterval(interval);
        }
        if (attempts > 20) clearInterval(interval); // Stop after 10s
      }, 500);
      return () => clearInterval(interval);
    }
  }, [text]);

  return (
    <div 
      className={`math-rendered-content ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHTML }}
    />
  );
};

export default MathRenderer;

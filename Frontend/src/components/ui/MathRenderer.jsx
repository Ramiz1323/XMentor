import { useEffect, useRef } from 'react';

const MathRenderer = ({ text, className = "" }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && window.katex) {
      // Logic to find and render math in text
      const content = text || "";
      
      // Simple regex to find $...$ (inline) and $$...$$ (block)
      // This is a basic version, for production we'd use a more robust parser
      // or the KaTeX auto-render extension.
      
      try {
        // We use a temporary div to render the content safely
        let html = content;

        // 1. Handle Block Math: $$ ... $$
        html = html.replace(/\$\$(.*?)\$\$/gs, (match, formula) => {
          try {
            return `<div class="math-block">${window.katex.renderToString(formula, { displayMode: true, throwOnError: false })}</div>`;
          } catch (e) { return match; }
        });

        // 2. Handle Inline Math: $ ... $
        html = html.replace(/\$(.*?)\$/g, (match, formula) => {
          try {
            return `<span class="math-inline">${window.katex.renderToString(formula, { displayMode: false, throwOnError: false })}</span>`;
          } catch (e) { return match; }
        });

        containerRef.current.innerHTML = html;
      } catch (err) {
        console.error("Math rendering error:", err);
        containerRef.current.textContent = content;
      }
    }
  }, [text]);

  return (
    <div 
      ref={containerRef} 
      className={`math-rendered-content ${className}`}
    >
      {text}
    </div>
  );
};

export default MathRenderer;

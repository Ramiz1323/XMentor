import React, { useMemo } from 'react';

const WebOutputPreview = ({ html = '', css = '', js = '' }) => {
  const combinedDoc = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          ${css}
        </style>
      </head>
      <body>
        ${html}
        <script>
          try {
            ${js}
          } catch (err) {
            console.error(err);
          }
        </script>
      </body>
      </html>
    `;
  }, [html, css, js]);

  return (
    <div className="web-preview-wrapper">
      <div className="preview-header">
        <span className="dot red"></span>
        <span className="dot yellow"></span>
        <span className="dot green"></span>
        <span className="preview-title">Live Preview</span>
      </div>
      <iframe
        title="output-preview"
        srcDoc={combinedDoc}
        sandbox="allow-scripts allow-modals allow-forms"
        className="preview-iframe"
      />
    </div>
  );
};

export default WebOutputPreview;

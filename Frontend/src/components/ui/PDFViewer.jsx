import { useEffect, useRef, useState } from 'react';
import { X, Lock, AlertTriangle, Loader2, FileWarning } from 'lucide-react';
import pdfService from '../../services/pdf.service';

/**
 * PDFViewer — View-only PDF modal.
 * Authenticated blob streaming + Chrome PDF params (#toolbar=0&navpanes=0)
 * Blocks Ctrl+S, Ctrl+P, and context menu.
 */
const PDFViewer = ({ pdf, onClose }) => {
  const overlayRef = useRef(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let createdUrl = null;

    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      try {
        const blob = await pdfService.getPdfBlob(pdf._id);
        if (!isMounted) return;
        
        // Ensure standard PDF mime type
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        createdUrl = URL.createObjectURL(pdfBlob);
        setBlobUrl(`${createdUrl}#toolbar=0&navpanes=0&scrollbar=1`);
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load PDF blob:', err);
        setError(err.message || 'Failed to stream secure PDF document');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [pdf._id]);

  // Block Ctrl+S (save) and Ctrl+P (print) while modal is open
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleKey, { capture: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, []);

  const blockContextMenu = (e) => e.preventDefault();

  return (
    <div className="pdf-modal-backdrop" role="dialog" aria-modal="true" aria-label={`Viewing: ${pdf.title}`}>
      <div className="pdf-modal">
        {/* Header */}
        <div className="pdf-modal-header">
          <div className="pdf-modal-title-group">
            <span className="pdf-lock-badge">
              <Lock size={13} /> View Only
            </span>
            <h2 className="pdf-modal-title">{pdf.title}</h2>
            <span className="pdf-modal-subject">{pdf.subject}</span>
          </div>
          <button
            className="pdf-modal-close"
            onClick={onClose}
            aria-label="Close viewer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Viewer area */}
        <div
          className="pdf-viewer-wrap"
          onContextMenu={blockContextMenu}
          ref={overlayRef}
        >
          <div
            className="pdf-click-guard"
            onContextMenu={blockContextMenu}
            aria-hidden="true"
          />

          {loading ? (
            <div className="pdf-loading">
              <Loader2 size={40} className="spin" />
              <p>Establishing secure stream...</p>
            </div>
          ) : error ? (
            <div className="pdf-loading danger-text">
              <FileWarning size={48} />
              <p>{error}</p>
              <button className="pdf-btn mt-4" onClick={onClose}>Close Viewer</button>
            </div>
          ) : (
            <object
              data={blobUrl}
              type="application/pdf"
              className="pdf-iframe"
            >
              <iframe
                src={blobUrl}
                title={pdf.title}
                className="pdf-iframe"
              />
            </object>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;

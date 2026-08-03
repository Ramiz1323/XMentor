import { useEffect, useState } from 'react';
import { X, Lock, FileWarning, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import pdfService from '../../services/pdf.service';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

/**
 * PDFViewer — View-only PDF modal.
 * Uses react-pdf for native rendering across all devices, bypassing iframe/object limitations on mobile.
 * Blocks Ctrl+S, Ctrl+P, and context menu.
 */
const PDFViewer = ({ pdf, onClose }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(null);

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
        setBlobUrl(createdUrl);
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

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

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
        >
          {loading && !blobUrl ? (
            <div className="pdf-loading" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <Loader2 size={40} className="spin" />
              <p>Establishing secure stream...</p>
            </div>
          ) : error ? (
            <div className="pdf-loading danger-text" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <FileWarning size={48} />
              <p>{error}</p>
              <button className="pdf-btn mt-4" onClick={onClose}>Close Viewer</button>
            </div>
          ) : blobUrl && (
            <div className="pdf-document-container" style={{ height: '100%', overflowY: 'auto', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#2c2e33' }}>
              <Document
                file={blobUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="pdf-loading">
                    <Loader2 size={40} className="spin" />
                    <p>Rendering document...</p>
                  </div>
                }
                error={
                  <div className="pdf-loading danger-text">
                    <FileWarning size={48} />
                    <p>Failed to render PDF.</p>
                  </div>
                }
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    className="pdf-page-wrapper"
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                ))}
              </Document>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;

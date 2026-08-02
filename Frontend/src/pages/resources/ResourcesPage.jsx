import { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Trash2, Eye, Users, BookOpen, ChevronDown, ChevronUp, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import pdfService from '../../services/pdf.service';
import PDFViewer from '../../components/ui/PDFViewer';
import GlassDropdown from '../../components/ui/GlassDropdown';

const SUBJECTS = [
  'MATHS','SCIENCE','PHYSICS','CHEMISTRY','BIOLOGY',
  'HISTORY','GEOGRAPHY','ENGLISH','BENGALI','HINDI',
  'EVS','SOCIAL_SCIENCE','COMPUTER','CODING','OTHERS'
];

const SUBJECT_OPTIONS = SUBJECTS.map(s => ({
  value: s,
  label: s.replace('_', ' ')
}));

// ─── Utility: human-readable file size ──────────────────────────────────────
const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Utility: subject display label ─────────────────────────────────────────
const subjectLabel = (s) => s.replace('_', ' ');

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER — Upload Form
// ─────────────────────────────────────────────────────────────────────────────
const UploadForm = ({ students, onUploaded }) => {
  const [form, setForm] = useState({ title: '', description: '', subject: 'OTHERS' });
  const [file, setFile] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
    } else {
      toast.error('Only PDF files are accepted');
    }
  };

  const toggleStudent = (id) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a PDF file');
    if (!form.title.trim()) return toast.error('Title is required');

    const fd = new FormData();
    fd.append('pdf', file);
    fd.append('title', form.title.trim());
    fd.append('description', form.description.trim());
    fd.append('subject', form.subject);
    fd.append('assignedStudents', JSON.stringify(selectedStudents));

    setUploading(true);
    setUploadProgress(0);
    // Simulate progress for large files
    const progressInterval = setInterval(() => {
      setUploadProgress(p => (p < 85 ? p + 5 : p));
    }, 400);

    try {
      await pdfService.uploadPdf(fd);
      clearInterval(progressInterval);
      setUploadProgress(100);
      toast.success('PDF uploaded successfully!');
      setForm({ title: '', description: '', subject: 'OTHERS' });
      setFile(null);
      setSelectedStudents([]);
      onUploaded();
    } catch (err) {
      clearInterval(progressInterval);
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <form className="pdf-upload-form glass-card" onSubmit={handleSubmit}>
      <h3 className="pdf-form-title">
        <Upload size={18} /> Upload New PDF Resource
      </h3>

      <div className="pdf-form-row">
        <div className="pdf-field">
          <label htmlFor="pdf-title">Title *</label>
          <input
            id="pdf-title"
            type="text"
            className="glass-input"
            placeholder="e.g. Chapter 5 — Thermodynamics Notes"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, subject: f.subject, title: e.target.value }))}
            required
          />
        </div>
        <div className="pdf-field">
          <GlassDropdown
            label="SUBJECT *"
            options={SUBJECT_OPTIONS}
            value={form.subject}
            onChange={val => setForm(f => ({ ...f, subject: val }))}
            placeholder="Select subject"
            icon={BookOpen}
          />
        </div>
      </div>

      <div className="pdf-field">
        <label htmlFor="pdf-desc">Description (optional)</label>
        <textarea
          id="pdf-desc"
          className="glass-input"
          rows={2}
          placeholder="Brief note about this PDF..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </div>

      {/* Drop zone */}
      <div
        className={`pdf-drop-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && fileRef.current.click()}
        aria-label="Select PDF file"
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,.pdf"
          style={{ display: 'none' }}
          onChange={e => setFile(e.target.files[0] || null)}
        />
        {file ? (
          <div className="pdf-drop-preview">
            <FileText size={32} />
            <span className="pdf-drop-name">{file.name}</span>
            <span className="pdf-drop-size">{formatSize(file.size)}</span>
          </div>
        ) : (
          <div className="pdf-drop-hint">
            <FileText size={40} />
            <p>Drag & drop your PDF here, or <u>click to browse</u></p>
            <span>Up to 100 MB · PDF only</span>
          </div>
        )}
      </div>

      {/* Student picker */}
      {students.length > 0 && (
        <div className="pdf-student-picker">
          <button
            type="button"
            className="pdf-picker-toggle"
            onClick={() => setShowStudentPicker(p => !p)}
          >
            <Users size={16} />
            Assign to Students ({selectedStudents.length}/{students.length})
            {showStudentPicker ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showStudentPicker && (
            <div className="pdf-student-list">
              {students.map(s => (
                <label key={s._id} className="pdf-student-item">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(s._id)}
                    onChange={() => toggleStudent(s._id)}
                  />
                  <img src={s.profilePic || undefined} alt="" className="pdf-avatar" />
                  <span>{s.name}</span>
                  <span className="pdf-username">@{s.username}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {uploading && (
        <div className="pdf-progress-bar-wrap">
          <div className="pdf-progress-bar" style={{ width: `${uploadProgress}%` }} />
          <span>{uploadProgress}%</span>
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={uploading}>
        {uploading ? <><Loader2 size={18} className="spin" /> Uploading...</> : <><Upload size={18} /> Upload PDF</>}
      </button>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER — PDF Card
// ─────────────────────────────────────────────────────────────────────────────
const TeacherPdfCard = ({ pdf, students, onDeleted, onReassigned }) => {
  const [deleting, setDeleting] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [assignedIds, setAssignedIds] = useState(pdf.assignedStudents.map(s => s._id));
  const [saving, setSaving] = useState(false);
  const [viewingPdf, setViewingPdf] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${pdf.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await pdfService.deletePdf(pdf._id);
      toast.success('PDF deleted');
      onDeleted(pdf._id);
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const toggleAssign = (id) => {
    setAssignedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSaveAssignment = async () => {
    setSaving(true);
    try {
      await pdfService.assignStudents(pdf._id, assignedIds);
      toast.success('Assignment updated');
      onReassigned(pdf._id, assignedIds);
      setShowAssign(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="pdf-card glass-card">
        <div className="pdf-card-icon">
          <FileText size={28} />
        </div>
        <div className="pdf-card-info">
          <h3 className="pdf-card-title">{pdf.title}</h3>
          <div className="pdf-card-meta">
            <span className="pdf-subject-tag">{subjectLabel(pdf.subject)}</span>
            {pdf.fileSizeBytes > 0 && <span className="pdf-size">{formatSize(pdf.fileSizeBytes)}</span>}
            <span className="pdf-date">{new Date(pdf.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          {pdf.description && <p className="pdf-card-desc">{pdf.description}</p>}
          <div className="pdf-card-assigned">
            <Users size={14} />
            {pdf.assignedStudents.length === 0
              ? 'Not assigned to anyone'
              : pdf.assignedStudents.map(s => s.name).join(', ')}
          </div>
        </div>
        <div className="pdf-card-actions">
          <button className="pdf-btn pdf-btn-view" onClick={() => setViewingPdf(true)} title="Preview PDF">
            <Eye size={16} /> Preview
          </button>
          <button className="pdf-btn pdf-btn-assign" onClick={() => setShowAssign(p => !p)} title="Assign to students">
            <Users size={16} /> Assign
          </button>
          <button className="pdf-btn pdf-btn-delete" onClick={handleDelete} disabled={deleting} title="Delete PDF">
            {deleting ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      {showAssign && (
        <div className="pdf-assign-panel glass-card">
          <h4>Assign Students for "{pdf.title}"</h4>
          {students.length === 0 ? (
            <p className="muted">No students in your roster yet.</p>
          ) : (
            <div className="pdf-student-list">
              {students.map(s => (
                <label key={s._id} className="pdf-student-item">
                  <input
                    type="checkbox"
                    checked={assignedIds.includes(s._id)}
                    onChange={() => toggleAssign(s._id)}
                  />
                  <img src={s.profilePic || undefined} alt="" className="pdf-avatar" />
                  <span>{s.name}</span>
                  <span className="pdf-username">@{s.username}</span>
                </label>
              ))}
            </div>
          )}
          <div className="pdf-assign-footer">
            <button className="btn-primary" onClick={handleSaveAssignment} disabled={saving}>
              {saving ? <Loader2 size={16} className="spin" /> : 'Save'}
            </button>
            <button className="pdf-btn" onClick={() => setShowAssign(false)}>Cancel</button>
          </div>
        </div>
      )}

      {viewingPdf && <PDFViewer pdf={pdf} onClose={() => setViewingPdf(false)} />}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT — PDF Card
// ─────────────────────────────────────────────────────────────────────────────
const StudentPdfCard = ({ pdf }) => {
  const [viewingPdf, setViewingPdf] = useState(false);

  return (
    <>
      <div className="pdf-card glass-card">
        <div className="pdf-card-icon">
          <FileText size={28} />
        </div>
        <div className="pdf-card-info">
          <h3 className="pdf-card-title">{pdf.title}</h3>
          <div className="pdf-card-meta">
            <span className="pdf-subject-tag">{subjectLabel(pdf.subject)}</span>
            {pdf.fileSizeBytes > 0 && <span className="pdf-size">{formatSize(pdf.fileSizeBytes)}</span>}
            <span className="pdf-date">{new Date(pdf.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          {pdf.description && <p className="pdf-card-desc">{pdf.description}</p>}
          <div className="pdf-card-assigned">
            <BookOpen size={14} /> From: {pdf.createdBy?.name || 'Your Teacher'}
          </div>
        </div>
        <div className="pdf-card-actions">
          <button className="pdf-btn pdf-btn-view" onClick={() => setViewingPdf(true)}>
            <Eye size={16} /> View PDF
          </button>
        </div>
      </div>

      {viewingPdf && <PDFViewer pdf={pdf} onClose={() => setViewingPdf(false)} />}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const ResourcesPage = () => {
  const { user } = useAuthStore();
  const isTeacher = user?.role === 'TEACHER';

  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  // For teacher: their linked student roster from profile
  const students = user?.students || [];

  const fetchPdfs = async () => {
    setLoading(true);
    try {
      const result = isTeacher
        ? await pdfService.listMyPdfs()
        : await pdfService.listAssignedPdfs();
      setPdfs(result.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load PDFs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  const handleDeleted = (deletedId) => {
    setPdfs(prev => prev.filter(p => p._id !== deletedId));
  };

  const handleReassigned = (pdfId, newStudentIds) => {
    setPdfs(prev => prev.map(p =>
      p._id === pdfId
        ? { ...p, assignedStudents: students.filter(s => newStudentIds.includes(s._id)) }
        : p
    ));
  };

  return (
    <div className="mcq-dashboard-container">
      <header>
        <div className="header-info">
          <h1 className="glow-text">
            {isTeacher ? 'PDF Resources' : 'My Study Resources'}
          </h1>
          <p className="subtitle">
            {isTeacher
              ? 'Upload notes, booklets, and papers. Students see them in-browser — no downloads.'
              : 'View study materials shared by your teacher. All documents are view-only.'}
          </p>
        </div>
      </header>

      {isTeacher && (
        <UploadForm students={students} onUploaded={fetchPdfs} />
      )}

      <div className="pdf-list mt-8">
        {loading ? (
          <div className="pdf-loading">
            <Loader2 size={36} className="spin" />
            <p>Loading resources...</p>
          </div>
        ) : pdfs.length === 0 ? (
          <div className="empty-state">
            <FileText size={64} className="empty-icon" />
            <h3>{isTeacher ? 'No PDFs uploaded yet' : 'No resources assigned yet'}</h3>
            <p>{isTeacher ? 'Upload your first PDF above.' : 'Your teacher has not shared any materials yet.'}</p>
          </div>
        ) : (
          pdfs.map(pdf =>
            isTeacher ? (
              <TeacherPdfCard
                key={pdf._id}
                pdf={pdf}
                students={students}
                onDeleted={handleDeleted}
                onReassigned={handleReassigned}
              />
            ) : (
              <StudentPdfCard key={pdf._id} pdf={pdf} />
            )
          )
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;

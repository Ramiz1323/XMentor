import api from '../lib/api';

const pdfService = {
  // Teacher: Upload a new PDF with metadata
  uploadPdf: async (formData) => {
    const { data } = await api.post('/pdf/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Teacher: Get all PDFs they have uploaded
  listMyPdfs: async () => {
    const { data } = await api.get('/pdf/my');
    return data;
  },

  // Teacher: Assign/update student list for a PDF
  assignStudents: async (pdfId, studentIds) => {
    const { data } = await api.patch(`/pdf/${pdfId}/assign`, { studentIds });
    return data;
  },

  // Teacher: Delete a PDF
  deletePdf: async (pdfId) => {
    const { data } = await api.delete(`/pdf/${pdfId}`);
    return data;
  },

  // Student: Get PDFs assigned to them
  listAssignedPdfs: async () => {
    const { data } = await api.get('/pdf/assigned');
    return data;
  },

  // Student/Teacher: Get PDF binary Blob with authenticated session
  getPdfBlob: async (pdfId) => {
    const response = await api.get(`/pdf/${pdfId}/view`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Returns the URL to use as the iframe src for view-only streaming
  getViewUrl: (pdfId) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${base}/pdf/${pdfId}/view`;
  },
};

export default pdfService;

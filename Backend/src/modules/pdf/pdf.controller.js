import * as pdfService from './pdf.service.js';

// POST /api/pdf/upload — TEACHER only
export const uploadPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    // Parse assignedStudents — may arrive as JSON string or array
    let assignedStudents = [];
    if (req.body.assignedStudents) {
      try {
        assignedStudents = typeof req.body.assignedStudents === 'string'
          ? JSON.parse(req.body.assignedStudents)
          : req.body.assignedStudents;
      } catch {
        assignedStudents = [];
      }
    }

    const metadata = {
      title: req.body.title,
      description: req.body.description || '',
      subject: req.body.subject,
      classLevel: req.body.classLevel,
      assignedStudents,
    };

    const resource = await pdfService.uploadPdf(
      req.user.id,
      req.file.buffer,
      req.file.originalname,
      metadata
    );

    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

// GET /api/pdf/my — TEACHER only
export const listMyPdfs = async (req, res, next) => {
  try {
    const resources = await pdfService.listMyPdfs(req.user.id);
    res.status(200).json({ success: true, data: resources });
  } catch (err) {
    next(err);
  }
};

// GET /api/pdf/assigned — STUDENT only
export const listAssignedPdfs = async (req, res, next) => {
  try {
    const resources = await pdfService.listAssignedPdfs(req.user.id);
    res.status(200).json({ success: true, data: resources });
  } catch (err) {
    next(err);
  }
};

// GET /api/pdf/:id/view — Authenticated, streams PDF inline (no download)
export const viewPdf = async (req, res, next) => {
  try {
    const { buffer, originalName, contentType } = await pdfService.streamPdf(
      req.params.id,
      req.user.id,
      req.user.role
    );

    // Security headers — force inline viewing, block caching / downloads
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(originalName)}"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/pdf/:id/assign — TEACHER only
export const assignStudents = async (req, res, next) => {
  try {
    const { studentIds } = req.body;
    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ success: false, message: 'studentIds must be an array' });
    }
    const resource = await pdfService.assignStudents(req.params.id, req.user.id, studentIds);
    res.status(200).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/pdf/:id — TEACHER only
export const deletePdf = async (req, res, next) => {
  try {
    const result = await pdfService.deletePdf(req.params.id, req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

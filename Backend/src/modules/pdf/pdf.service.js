import axios from 'axios';
import PdfResource from './pdf.model.js';
import imagekit from '../../config/imagekit.js';
import ErrorResponse from '../../utils/errorResponse.js';
import logger from '../../utils/logger.js';

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD PDF — Teacher uploads a PDF, stored in ImageKit /xmentor/pdfs/
// ─────────────────────────────────────────────────────────────────────────────
export const uploadPdf = async (teacherId, fileBuffer, originalName, metadata) => {
  const { title, description, subject, assignedStudents } = metadata;

  const safeFileName = `pdf_${teacherId}_${Date.now()}_${originalName.replace(/\s+/g, '_')}`;

  const uploadResponse = await imagekit.files.upload({
    file: fileBuffer.toString('base64'),
    fileName: safeFileName,
    folder: '/xmentor/pdfs',
  });

  const resource = await PdfResource.create({
    title,
    description: description || '',
    subject,
    pdfUrl: uploadResponse.url,
    pdfFileId: uploadResponse.fileId,
    originalName: originalName,
    fileSizeBytes: fileBuffer.length,
    createdBy: teacherId,
    assignedStudents: assignedStudents || [],
  });

  return resource;
};

// ─────────────────────────────────────────────────────────────────────────────
// LIST MY PDFs — Teacher sees all their uploaded PDFs
// ─────────────────────────────────────────────────────────────────────────────
export const listMyPdfs = async (teacherId) => {
  const resources = await PdfResource.find({ createdBy: teacherId })
    .populate('assignedStudents', 'name username profilePic')
    .sort('-createdAt')
    .lean();
  return resources;
};

// ─────────────────────────────────────────────────────────────────────────────
// LIST ASSIGNED PDFs — Student sees PDFs assigned to them
// ─────────────────────────────────────────────────────────────────────────────
export const listAssignedPdfs = async (studentId) => {
  const resources = await PdfResource.find({ assignedStudents: studentId })
    .populate('createdBy', 'name username profilePic')
    .sort('-createdAt')
    .lean();
  return resources;
};

// ─────────────────────────────────────────────────────────────────────────────
// STREAM PDF — Fetch PDF bytes from ImageKit and return for inline streaming.
// Security: Caller must verify the requesting user is assigned to this PDF.
// ─────────────────────────────────────────────────────────────────────────────
export const streamPdf = async (pdfId, requestingUserId, userRole) => {
  const resource = await PdfResource.findById(pdfId).lean();
  if (!resource) throw new ErrorResponse('PDF resource not found', 404);

  // TEACHERs who own the PDF can also view it
  const isOwner = resource.createdBy.toString() === requestingUserId.toString();
  const isAssigned = resource.assignedStudents.some(
    (id) => id.toString() === requestingUserId.toString()
  );

  if (!isOwner && !isAssigned) {
    throw new ErrorResponse('You are not authorised to view this PDF', 403);
  }

  // Fetch the raw PDF bytes from ImageKit's URL
  const response = await axios.get(resource.pdfUrl, {
    responseType: 'arraybuffer',
    timeout: 30000,
  });

  return {
    buffer: Buffer.from(response.data),
    originalName: resource.originalName || 'document.pdf',
    contentType: response.headers['content-type'] || 'application/pdf',
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// ASSIGN STUDENTS — Teacher assigns/updates which students can see a PDF
// ─────────────────────────────────────────────────────────────────────────────
export const assignStudents = async (pdfId, teacherId, studentIds) => {
  const resource = await PdfResource.findById(pdfId);
  if (!resource) throw new ErrorResponse('PDF resource not found', 404);
  if (resource.createdBy.toString() !== teacherId.toString()) {
    throw new ErrorResponse('Not authorised to modify this PDF', 403);
  }

  resource.assignedStudents = studentIds;
  await resource.save();

  return await resource.populate('assignedStudents', 'name username profilePic');
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE PDF — Teacher deletes their PDF (removes from ImageKit + MongoDB)
// ─────────────────────────────────────────────────────────────────────────────
export const deletePdf = async (pdfId, teacherId) => {
  const resource = await PdfResource.findById(pdfId);
  if (!resource) throw new ErrorResponse('PDF resource not found', 404);
  if (resource.createdBy.toString() !== teacherId.toString()) {
    throw new ErrorResponse('Not authorised to delete this PDF', 403);
  }

  // Delete from ImageKit
  try {
    await imagekit.files.delete(resource.pdfFileId);
  } catch (err) {
    logger.error('pdf_imagekit_delete_failed', { error: err.message, fileId: resource.pdfFileId });
    // Continue deletion from DB even if ImageKit fails
  }

  await resource.deleteOne();
  return { message: 'PDF resource deleted successfully' };
};

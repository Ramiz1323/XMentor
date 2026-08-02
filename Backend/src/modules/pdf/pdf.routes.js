import express from 'express';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { uploadPdfMiddleware } from '../../middleware/upload.middleware.js';
import {
  uploadPdf,
  listMyPdfs,
  listAssignedPdfs,
  viewPdf,
  assignStudents,
  deletePdf,
} from './pdf.controller.js';

const router = express.Router();

router.use(protect);

// Teacher routes
router.post('/upload', authorize('TEACHER'), uploadPdfMiddleware.single('pdf'), uploadPdf);
router.get('/my', authorize('TEACHER'), listMyPdfs);
router.patch('/:id/assign', authorize('TEACHER'), assignStudents);
router.delete('/:id', authorize('TEACHER'), deletePdf);

// Student routes
router.get('/assigned', authorize('STUDENT'), listAssignedPdfs);

// Shared view route — auth + assignment check inside service
router.get('/:id/view', viewPdf);

export default router;

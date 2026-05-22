import express from 'express';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/community.middleware.js';
import { generateQaSchema } from './ai.validation.js';
import { generateQa } from './ai.controller.js';

const router = express.Router();

// Only TEACHER and ADMIN can generate questions
router.post('/generate-qa', protect, authorize('TEACHER', 'ADMIN'), validate(generateQaSchema), generateQa);

export default router;

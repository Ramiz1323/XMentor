import express from 'express';
import * as mcqController from './mcq.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/community.middleware.js';
import { createTestSchema, submitTestSchema } from './mcq.validation.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('TEACHER'), validate(createTestSchema), mcqController.create);
router.get('/:id', mcqController.getById);
router.post('/:id/submit', validate(submitTestSchema), mcqController.submit);
router.get('/community/:communityId', mcqController.getByCommunity);

export default router;

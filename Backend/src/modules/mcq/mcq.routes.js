import express from 'express';
import * as mcqController from './mcq.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/community.middleware.js';
import { createTestSchema, submitTestSchema } from './mcq.validation.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('TEACHER'), validate(createTestSchema), mcqController.create);
router.get('/my-tests', mcqController.getMine);
router.get('/community/:communityId', mcqController.getByCommunity); 
router.get('/:id', mcqController.getById);
router.get('/:id/analytics', authorize('TEACHER'), mcqController.getAnalytics);
router.get('/teacher/overview', authorize('TEACHER'), mcqController.getOverview);
router.post('/:id/submit', validate(submitTestSchema), mcqController.submit);
router.delete('/:id', authorize('TEACHER'), mcqController.remove);

export default router;

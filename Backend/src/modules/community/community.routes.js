import express from 'express';
import * as communityController from './community.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/community.middleware.js';
import { 
  createCommunitySchema, 
  joinCommunitySchema, 
  leaveCommunitySchema 
} from './community.validation.js';

const router = express.Router();

router.use(protect);

router.get('/', communityController.getAll);
router.post('/', authorize('TEACHER'), validate(createCommunitySchema), communityController.create);

router.get('/:id', communityController.getById);
router.post('/:id/join', validate(joinCommunitySchema), communityController.join);
router.post('/:id/leave', validate(leaveCommunitySchema), communityController.leave);

// Optimized: Membership check is moved to service layer to save one DB hit
router.get('/:id/members', communityController.getMembers);

export default router;

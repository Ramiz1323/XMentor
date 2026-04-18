import express from 'express';
import * as communityController from './community.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { isCommunityMember, validate } from '../../middleware/community.middleware.js';
import { 
  createCommunitySchema, 
  joinCommunitySchema, 
  leaveCommunitySchema 
} from './community.validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Global community endpoints
router.get('/', communityController.getAll);
router.post('/', authorize('TEACHER'), validate(createCommunitySchema), communityController.create);

// Specific community endpoints
router.get('/:id', communityController.getById); // Hybrid View
router.post('/:id/join', validate(joinCommunitySchema), communityController.join);
router.post('/:id/leave', validate(leaveCommunitySchema), communityController.leave);

// Member-only endpoints
router.get('/:id/members', isCommunityMember, communityController.getMembers);

export default router;

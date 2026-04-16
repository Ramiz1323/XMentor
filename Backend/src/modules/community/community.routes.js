import express from 'express';
import {
  create,
  getAll,
  getById,
  join,
  leave,
  getMembers,
} from './community.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { isCommunityMember } from '../../middleware/community.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAll);
router.get('/:id', getById);

router.get('/:id/members', isCommunityMember, getMembers);

router.post('/', authorize('TEACHER'), create);

router.post('/:id/join', join);
router.post('/:id/leave', leave);

export default router;

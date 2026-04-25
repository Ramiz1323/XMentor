import express from 'express';
import * as doubtController from './doubt.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import upload from '../../middleware/upload.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .post(authorize('STUDENT'), upload.single('image'), doubtController.ask)
  .get(doubtController.getAll);

router.route('/:id')
  .get(doubtController.getById)
  .delete(authorize('STUDENT'), doubtController.remove);

router.put('/:id/resolve', authorize('TEACHER'), doubtController.resolve);

export default router;

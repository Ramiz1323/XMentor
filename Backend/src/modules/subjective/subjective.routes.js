import express from 'express';
import { 
  createSubjectiveTest, 
  getSubjectiveTests, 
  getSubjectiveTest, 
  submitSubjectiveTest,
  getPendingSubmissions,
  gradeSubmission,
  deleteSubjectiveTest
} from './subjective.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('TEACHER'), createSubjectiveTest)
  .get(getSubjectiveTests);

router.get('/submissions/pending', authorize('TEACHER'), getPendingSubmissions);

router.route('/:id')
  .get(getSubjectiveTest)
  .post(authorize('STUDENT'), submitSubjectiveTest)
  .delete(authorize('TEACHER'), deleteSubjectiveTest);

router.put('/grade/:id', authorize('TEACHER'), gradeSubmission);

export default router;

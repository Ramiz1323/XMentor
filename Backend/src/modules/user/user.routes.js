import express from 'express';
import { getMyProfile, updateMyProfile, uploadProfilePic, addStudent, getStats, getLeaderboard } from './user.controller.js';
import { protect, authorize } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/community.middleware.js';
import upload from '../../middleware/upload.middleware.js';
import { updateProfileSchema } from './user.validation.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getMyProfile);
router.get('/stats', getStats);
router.get('/leaderboard', getLeaderboard);
router.put('/profile', validate(updateProfileSchema), updateMyProfile);
router.post('/upload-profile-pic', upload.single('image'), uploadProfilePic);
router.post('/add-student', authorize('TEACHER'), addStudent);

export default router;

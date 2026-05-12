import express from 'express';
import { getMyProfile, updateMyProfile, uploadProfilePic, addStudent, getStats, getLeaderboard, savePushSubscription, getPendingTeachers, verifyTeacher } from './user.controller.js';
import { protect, authorize, admin } from '../../middleware/auth.middleware.js';
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
router.post('/push-subscribe', savePushSubscription);

// Admin Routes
router.get('/pending-teachers', admin, getPendingTeachers);
router.patch('/verify-teacher/:id', admin, verifyTeacher);

export default router;

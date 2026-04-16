import express from 'express';
import { getMyProfile, updateMyProfile, uploadProfilePic } from './user.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import upload from '../../middleware/upload.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);
router.post('/upload-profile-pic', upload.single('image'), uploadProfilePic);

export default router;

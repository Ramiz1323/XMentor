import express from 'express';
import { getMyProfile, updateMyProfile, uploadProfilePic } from './user.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/community.middleware.js';
import upload from '../../middleware/upload.middleware.js';
import { updateProfileSchema } from './user.validation.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getMyProfile);
router.put('/profile', validate(updateProfileSchema), updateMyProfile);
router.post('/upload-profile-pic', upload.single('image'), uploadProfilePic);

export default router;

import asyncHandler from '../../utils/asyncHandler.js';
import * as userService from './user.service.js';
import ErrorResponse from '../../utils/errorResponse.js';
import cache from '../../utils/cache.js';

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.user._id);
  res.status(200).json({
    success: true,
    message: 'Profile retrieved',
    data: profile,
  });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const updatedProfile = await userService.updateProfile(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: 'Profile updated',
    data: updatedProfile,
  });
});

export const uploadProfilePic = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ErrorResponse('Please upload an image', 400);
  }

  const updatedUser = await userService.handleImageUpload(
    req.user._id,
    req.file.buffer,
    req.file.originalname
  );

  res.status(200).json({
    success: true,
    message: 'Profile picture updated',
    data: updatedUser,
  });
});

export const addStudent = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) throw new ErrorResponse('Student username is required', 400);

  const result = await userService.linkStudentByUsername(req.user._id, username);

  res.status(200).json({
    success: true,
    message: 'Student added successfully',
    data: result,
  });
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await userService.getDashboardStats(req.user._id, req.user.role);
  res.status(200).json({
    success: true,
    message: 'Stats retrieved',
    data: stats,
  });
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  const cacheKey = `leaderboard_${req.user._id}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return res.status(200).json({
      success: true,
      message: 'Leaderboard retrieved (cached)',
      data: cachedData,
    });
  }

  const leaderboard = await userService.getGlobalLeaderboard(req.user._id);
  
  // Cache for 5 minutes
  cache.set(cacheKey, leaderboard, 300);

  res.status(200).json({
    success: true,
    message: 'Leaderboard retrieved',
    data: leaderboard,
  });
});

export const savePushSubscription = asyncHandler(async (req, res) => {
  if (!req.body.endpoint) throw new ErrorResponse('Subscription endpoint required', 400);

  await userService.updatePushSubscription(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Push subscription active on this device',
  });
});

export const getPendingTeachers = asyncHandler(async (req, res) => {
  const teachers = await userService.fetchPendingTeachers();
  res.status(200).json({
    success: true,
    data: teachers,
  });
});

export const verifyTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const teacher = await userService.approveTeacher(id);
  res.status(200).json({
    success: true,
    message: 'Teacher verified successfully',
    data: teacher,
  });
});

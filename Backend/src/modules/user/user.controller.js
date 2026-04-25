import asyncHandler from '../../utils/asyncHandler.js';
import * as userService from './user.service.js';
import ErrorResponse from '../../utils/errorResponse.js';

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
  const leaderboard = await userService.getGlobalLeaderboard();
  res.status(200).json({
    success: true,
    message: 'Leaderboard retrieved',
    data: leaderboard,
  });
});

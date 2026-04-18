import asyncHandler from '../../utils/asyncHandler.js';
import * as communityService from './community.service.js';

/**
 * @desc    Create new community
 * @route   POST /api/community
 * @access  Private/Teacher
 */
export const create = asyncHandler(async (req, res) => {
  const result = await communityService.createCommunity(req.body, req.user._id);
  
  res.status(201).json({
    success: true,
    message: 'Community created successfully',
    data: result,
  });
});

/**
 * @desc    Get all communities
 * @route   GET /api/community
 * @access  Private
 */
export const getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.type) filters.type = req.query.type;

  const communities = await communityService.getAllCommunities(filters);
  
  res.status(200).json({
    success: true,
    message: 'Communities retrieved successfully',
    data: communities,
  });
});

/**
 * @desc    Get single community (Hybrid view)
 * @route   GET /api/community/:id
 * @access  Private
 */
export const getById = asyncHandler(async (req, res) => {
  const result = await communityService.getCommunityById(req.params.id, req.user._id);
  
  res.status(200).json({
    success: true,
    message: 'Community details retrieved',
    data: result,
  });
});

/**
 * @desc    Join a community
 * @route   POST /api/community/:id/join
 * @access  Private
 */
export const join = asyncHandler(async (req, res) => {
  const result = await communityService.joinCommunity(req.params.id, req.user._id);
  
  res.status(200).json({
    success: true,
    message: result.alreadyMember ? 'You are already a member' : 'Joined community successfully',
    data: result.community,
  });
});

/**
 * @desc    Leave a community
 * @route   POST /api/community/:id/leave
 * @access  Private
 */
export const leave = asyncHandler(async (req, res) => {
  await communityService.leaveCommunity(req.params.id, req.user._id);
  
  res.status(200).json({
    success: true,
    message: 'Left community successfully',
    data: null,
  });
});

/**
 * @desc    Get community members (Privacy applied)
 * @route   GET /api/community/:id/members
 * @access  Private/MemberOnly
 */
export const getMembers = asyncHandler(async (req, res) => {
  const members = await communityService.getCommunityMembers(req.params.id, req.user.role);
  
  res.status(200).json({
    success: true,
    message: 'Members retrieved successfully',
    data: members,
  });
});

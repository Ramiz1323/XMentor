import asyncHandler from '../../utils/asyncHandler.js';
import * as communityService from './community.service.js';

export const create = asyncHandler(async (req, res) => {
  const result = await communityService.createCommunity(req.body, req.user._id);
  res.status(201).json({ success: true, message: 'Community created', data: result });
});

export const getAll = asyncHandler(async (req, res) => {
  const communities = await communityService.getAllCommunities(req.query.type ? { type: req.query.type } : {});
  res.status(200).json({ success: true, message: 'Communities retrieved', data: communities });
});

export const getById = asyncHandler(async (req, res) => {
  const result = await communityService.getCommunityById(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Community details retrieved', data: result });
});

export const join = asyncHandler(async (req, res) => {
  const result = await communityService.joinCommunity(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: result.alreadyMember ? 'Already a member' : 'Joined successfully',
    data: result.community,
  });
});

export const leave = asyncHandler(async (req, res) => {
  await communityService.leaveCommunity(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Left successfully', data: null });
});

export const getMembers = asyncHandler(async (req, res) => {
  const members = await communityService.getCommunityMembers(req.params.id, req.user._id, req.user.role);
  res.status(200).json({ success: true, message: 'Members retrieved', data: members });
});

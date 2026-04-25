import asyncHandler from '../../utils/asyncHandler.js';
import * as communityService from './community.service.js';

export const create = asyncHandler(async (req, res) => {
  const result = await communityService.createCommunity(req.body, req.user._id);
  res.status(201).json({ success: true, message: 'Community created', data: result });
});

export const getAll = asyncHandler(async (req, res) => {
  const communities = await communityService.getAllCommunities(
    req.user._id,
    req.query.type ? { type: req.query.type } : {}
  );
  res.status(200).json({ success: true, message: 'Communities retrieved', data: communities });
});

export const getById = asyncHandler(async (req, res) => {
  const result = await communityService.getCommunityById(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Community details retrieved', data: result });
});

export const join = asyncHandler(async (req, res) => {
  const trimmedAlias = (req.body.alias || '').trim();
  if (!trimmedAlias) return res.status(400).json({ success: false, message: 'Alias is required for anonymity' });

  const { accessCode } = req.body;
  const result = await communityService.joinCommunity(req.params.id, req.user._id, trimmedAlias, accessCode);
  res.status(200).json({
    success: true,
    message: result.alreadyMember ? 'Already a member' : 'Joined successfully',
    data: { community: result.community, alias: result.alias },
  });
});

export const getHistory = asyncHandler(async (req, res) => {
  const messages = await communityService.getChatHistory(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: messages });
});

export const leave = asyncHandler(async (req, res) => {
  await communityService.leaveCommunity(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Left successfully', data: null });
});

export const getMembers = asyncHandler(async (req, res) => {
  const members = await communityService.getCommunityMembers(req.params.id, req.user._id, req.user.role);
  res.status(200).json({ success: true, message: 'Members retrieved', data: members });
});

export const remove = asyncHandler(async (req, res) => {
  await communityService.deleteCommunity(req.params.id, req.user._id);
  
  // Notify all socket clients in that room
  const io = req.app.get('socketio');
  if (io && typeof io.to === 'function') {
    io.to(req.params.id).emit('community_terminated', { communityId: req.params.id });
  } else {
    console.warn('[Community] Socket.IO not available for termination broadcast');
  }

  res.status(200).json({ success: true, message: 'Community terminated successfully' });
});

export const verifyPasscode = asyncHandler(async (req, res) => {
  const { passcode } = req.body;
  await communityService.verifyDailyPasscode(passcode);
  res.status(200).json({ success: true, message: 'Passcode verified' });
});

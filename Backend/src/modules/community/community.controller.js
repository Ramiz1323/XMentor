import * as communityService from './community.service.js';

export const create = async (req, res) => {
  try {
    const community = await communityService.createCommunity(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      data: community,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const filters = {};
    if (req.query.type) filters.type = req.query.type;

    const communities = await communityService.getAllCommunities(filters);
    res.status(200).json({
      success: true,
      message: 'Communities retrieved successfully',
      data: communities,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const community = await communityService.getCommunityById(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Community details retrieved',
      data: community,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const join = async (req, res) => {
  try {
    const community = await communityService.joinCommunity(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Joined community successfully',
      data: community,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const leave = async (req, res) => {
  try {
    await communityService.leaveCommunity(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Left community successfully',
      data: null,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMembers = async (req, res) => {
  try {
    const members = await communityService.getCommunityMembers(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Members retrieved successfully',
      data: members,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

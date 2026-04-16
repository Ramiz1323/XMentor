import Community from '../modules/community/community.model.js';

export const isCommunityMember = async (req, res, next) => {
  try {
    const communityId = req.params.id || req.body.communityId;
    
    if (!communityId) {
      return res.status(400).json({ success: false, message: 'Community ID is required' });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    const isMember = community.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this community.',
      });
    }

    req.community = community;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

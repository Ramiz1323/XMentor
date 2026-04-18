import Community from './community.model.js';
import ErrorResponse from '../../utils/errorResponse.js';

export const getAllCommunities = async (filters = {}) => {
  return await Community.find(filters)
    .select('name description type memberCount maxMembers')
    .lean();
};

export const getCommunityById = async (communityId, userId) => {
  const community = await Community.findById(communityId)
    .populate('createdBy', 'name profilePic')
    .lean();

  if (!community) {
    throw new ErrorResponse('Community not found', 404);
  }

  const isMember = community.members?.some(
    (id) => id.toString() === userId.toString()
  );

  if (!isMember) {
    const { members, accessCode, ...publicView } = community;
    return { ...publicView, isMember: false };
  }

  return { ...community, isMember: true };
};

export const createCommunity = async (communityData, creatorId) => {
  const { name, description, type, accessCode, maxMembers } = communityData;

  const existing = await Community.findOne({ name });
  if (existing) {
    throw new ErrorResponse('Community name already exists', 400);
  }

  return await Community.create({
    name,
    description,
    type,
    accessCode,
    maxMembers,
    createdBy: creatorId,
    members: [creatorId],
    memberCount: 1,
  });
};

export const joinCommunity = async (communityId, userId) => {
  const community = await Community.findById(communityId);
  if (!community) throw new ErrorResponse('Community not found', 404);

  const alreadyMember = community.members.some(
    (id) => id.toString() === userId.toString()
  );
  if (alreadyMember) {
    return { alreadyMember: true, community };
  }

  if (community.memberCount >= community.maxMembers) {
    throw new ErrorResponse('Community is full', 400);
  }

  const updatedCommunity = await Community.findByIdAndUpdate(
    communityId,
    { 
      $addToSet: { members: userId },
      $inc: { memberCount: 1 }
    },
    { new: true, runValidators: true }
  ).lean();

  return { alreadyMember: false, community: updatedCommunity };
};

export const leaveCommunity = async (communityId, userId) => {
  const community = await Community.findById(communityId);
  if (!community) throw new ErrorResponse('Community not found', 404);

  if (community.createdBy.toString() === userId.toString()) {
    throw new ErrorResponse('Creators cannot leave their community', 400);
  }

  const isMember = community.members.some(
    (id) => id.toString() === userId.toString()
  );
  if (!isMember) {
    throw new ErrorResponse('You are not a member', 400);
  }

  return await Community.findByIdAndUpdate(
    communityId,
    { 
      $pull: { members: userId },
      $inc: { memberCount: -1 }
    },
    { new: true }
  );
};

export const getCommunityMembers = async (communityId, userId, userRole) => {
  const community = await Community.findById(communityId)
    .populate({
      path: 'members',
      select: userRole === 'TEACHER' ? 'name profilePic email' : 'name profilePic',
    })
    .lean();

  if (!community) throw new ErrorResponse('Community not found', 404);

  const isMember = community.members.some(
    (member) => member._id.toString() === userId.toString()
  );

  if (!isMember) {
    throw new ErrorResponse('Access denied. You are not a member', 403);
  }
  
  return community.members;
};

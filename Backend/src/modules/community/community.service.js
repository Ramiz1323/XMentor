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

  // Check if requester is a member
  const isMember = community.members.some(
    (id) => id.toString() === userId.toString()
  );

  if (!isMember) {
    // Return Public View (Metadata only)
    const { members, accessCode, ...publicView } = community;
    return { ...publicView, isMember: false };
  }

  // Return Full View (including members summary if needed, or specific member-only data)
  return { ...community, isMember: true };
};

//Teacher Only
export const createCommunity = async (communityData, creatorId) => {
  const { name, description, type, accessCode, maxMembers } = communityData;

  // Check if name is taken
  const existing = await Community.findOne({ name });
  if (existing) {
    throw new ErrorResponse('Community name already exists', 400);
  }

  const community = await Community.create({
    name,
    description,
    type,
    accessCode,
    maxMembers,
    createdBy: creatorId,
    members: [creatorId], 
    memberCount: 1,
  });

  return community;
};

//Student Only
export const joinCommunity = async (communityId, userId) => {
  const community = await Community.findById(communityId);
  if (!community) throw new ErrorResponse('Community not found', 404);

  // 1. Check if user is already a member
  const alreadyMember = community.members.some(
    (id) => id.toString() === userId.toString()
  );
  if (alreadyMember) {
    return { alreadyMember: true, community };
  }

  // 2. Enforce limit (Soft limit from model or parameter)
  if (community.memberCount >= community.maxMembers) {
    throw new ErrorResponse('Community is full (Limit reached)', 400);
  }

  // 3. Atomically add member and increment count
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

/**
 * Leave a community with creator protection
 */
export const leaveCommunity = async (communityId, userId) => {
  const community = await Community.findById(communityId);
  if (!community) throw new ErrorResponse('Community not found', 404);

  // 1. Creator cannot leave
  if (community.createdBy.toString() === userId.toString()) {
    throw new ErrorResponse('Creators cannot leave their community. Delete it instead.', 400);
  }

  // 2. Verify membership before removing
  const isMember = community.members.some(
    (id) => id.toString() === userId.toString()
  );
  if (!isMember) {
    throw new ErrorResponse('You are not a member of this community', 400);
  }

  // 3. Remove and decrement
  return await Community.findByIdAndUpdate(
    communityId,
    { 
      $pull: { members: userId },
      $inc: { memberCount: -1 }
    },
    { new: true }
  );
};

/**
 * Get members with strict data privacy
 */
export const getCommunityMembers = async (communityId, requesterRole) => {
  const community = await Community.findById(communityId)
    .populate({
      path: 'members',
      select: requesterRole === 'TEACHER' ? 'name profilePic email' : 'name profilePic',
    })
    .lean();

  if (!community) throw new ErrorResponse('Community not found', 404);
  
  return community.members;
};

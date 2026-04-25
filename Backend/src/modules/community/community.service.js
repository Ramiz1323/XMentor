import Community, { Message } from './community.model.js';
import ErrorResponse from '../../utils/errorResponse.js';

export const getAllCommunities = async (userId, filters = {}) => {
  const communities = await Community.find(filters)
    .select('name description type memberCount maxMembers createdBy members')
    .lean();

  return communities.map(community => {
    const member = community.members?.find(m => m.user.toString() === userId.toString());
    const { members, ...rest } = community;
    return {
      ...rest,
      isMember: !!member,
      myAlias: member?.alias || null
    };
  });
};

export const getCommunityById = async (communityId, userId) => {
  const community = await Community.findById(communityId)
    .populate('createdBy', 'name')
    .lean();

  if (!community) {
    throw new ErrorResponse('Community not found', 404);
  }

  const memberInfo = community.members?.find(
    (m) => m.user.toString() === userId.toString()
  );

  if (!memberInfo) {
    const { members, accessCode, ...publicView } = community;
    return { ...publicView, isMember: false };
  }

  return { ...community, isMember: true, myAlias: memberInfo.alias };
};

export const createCommunity = async (communityData, creatorId) => {
  const { name, description, type, accessCode, maxMembers, alias } = communityData;

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
    members: [{ user: creatorId, alias: alias || 'Mentor' }],
    memberCount: 1,
  });
};

export const joinCommunity = async (communityId, userId, alias, accessCode) => {
  const community = await Community.findById(communityId);
  if (!community) throw new ErrorResponse('Community not found', 404);

  if (community.accessCode && community.accessCode !== accessCode) {
    throw new ErrorResponse('Invalid access code', 403);
  }

  const member = community.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  
  if (member) {
    return { alreadyMember: true, community, alias: member.alias };
  }

  // Atomic update to check for alias uniqueness and capacity
  const updatedCommunity = await Community.findOneAndUpdate(
    { 
      _id: communityId,
      "members.alias": { $ne: alias },
      memberCount: { $lt: community.maxMembers }
    },
    { 
      $push: { members: { user: userId, alias } },
      $inc: { memberCount: 1 }
    },
    { new: true, runValidators: true }
  ).lean();

  if (!updatedCommunity) {
    // Re-check why it failed
    if (community.memberCount >= community.maxMembers) {
      throw new ErrorResponse('Community is full', 400);
    }
    throw new ErrorResponse('Alias already taken in this community', 400);
  }

  return { alreadyMember: false, community: updatedCommunity, alias };
};

export const leaveCommunity = async (communityId, userId) => {
  const community = await Community.findById(communityId);
  if (!community) throw new ErrorResponse('Community not found', 404);

  if (community.createdBy.toString() === userId.toString()) {
    throw new ErrorResponse('Creators cannot leave their community', 400);
  }

  const isMember = community.members.some(
    (m) => m.user.toString() === userId.toString()
  );
  if (!isMember) {
    throw new ErrorResponse('You are not a member', 400);
  }

  return await Community.findByIdAndUpdate(
    communityId,
    { 
      $pull: { members: { user: userId } },
      $inc: { memberCount: -1 }
    },
    { new: true }
  );
};

export const getCommunityMembers = async (communityId, userId, userRole) => {
  const community = await Community.findById(communityId).lean();
  if (!community) throw new ErrorResponse('Community not found', 404);

  const isMember = community.members.some(
    (m) => m.user.toString() === userId.toString()
  );

  if (!isMember && userRole !== 'TEACHER') {
    throw new ErrorResponse('Access denied. You are not a member', 403);
  }
  
  // Only return aliases to ensure anonymity
  return community.members.map(m => ({
    alias: m.alias,
    joinedAt: m.joinedAt
  }));
};

export const getChatHistory = async (communityId, userId) => {
  const community = await Community.findById(communityId).lean();
  if (!community) throw new ErrorResponse('Community not found', 404);

  const isMember = community.members.some(
    (m) => m.user.toString() === userId.toString()
  );

  if (!isMember) {
    throw new ErrorResponse('Access denied. Join community to view chat', 403);
  }

  const messages = await Message.find({ community: communityId })
    .sort({ createdAt: -1 })
    .limit(100)
    .select('content senderAlias createdAt isSystem')
    .lean();

  return messages.reverse();
};

export const saveMessage = async (communityId, userId, content) => {
  const community = await Community.findById(communityId);
  if (!community) return null;

  const member = community.members.find(m => m.user.toString() === userId.toString());
  if (!member) return null;

  return await Message.create({
    community: communityId,
    sender: userId,
    senderAlias: member.alias,
    content
  });
};

export const deleteCommunity = async (communityId, userId) => {
  const community = await Community.findById(communityId);
  if (!community) throw new ErrorResponse('Community not found', 404);

  // Only the creator (Teacher) can delete
  if (community.createdBy.toString() !== userId.toString()) {
    throw new ErrorResponse('Not authorized to delete this community', 403);
  }

  // Delete all messages in this community first
  await Message.deleteMany({ community: communityId });
  
  // Delete the community itself
  return await Community.findByIdAndDelete(communityId);
};

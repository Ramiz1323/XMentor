import Community from './community.model.js';

export const getCommunityById = async (communityId) => {
  return await Community.findById(communityId)
    .populate('createdBy', 'name email profilePic')
    .populate('members', 'name email profilePic');
};

export const getAllCommunities = async (filters = {}) => {
  return await Community.find(filters)
    .populate('createdBy', 'name email')
    .select('-members'); 
};

export const createCommunity = async (communityData, creatorId) => {
  const { name, description, type } = communityData;

  const community = await Community.create({
    name,
    description,
    type,
    createdBy: creatorId,
    members: [creatorId], 
  });

  return community;
};

export const joinCommunity = async (communityId, userId) => {
  return await Community.findByIdAndUpdate(
    communityId,
    { $addToSet: { members: userId } },
    { new: true, runValidators: true }
  ).populate('members', 'name email profilePic');
};

export const leaveCommunity = async (communityId, userId) => {
  const community = await Community.findById(communityId);
  if (!community) throw new Error('Community not found');

  if (community.createdBy.toString() === userId) {
    throw new Error('As the creator, you cannot leave the community. Delete it instead.');
  }

  return await Community.findByIdAndUpdate(
    communityId,
    { $pull: { members: userId } },
    { new: true }
  );
};

export const getCommunityMembers = async (communityId) => {
  const community = await Community.findById(communityId).populate(
    'members',
    'name email profilePic'
  );
  return community.members;
};

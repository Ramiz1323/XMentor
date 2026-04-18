import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Community from '../modules/community/community.model.js';

export const isCommunityMember = asyncHandler(async (req, res, next) => {
  const communityId = req.params.id;
  const userId = req.user._id;

  const community = await Community.findById(communityId).lean();

  if (!community) {
    return next(new ErrorResponse('Community not found', 404));
  }

  const isMember = community.members.some(
    (id) => id.toString() === userId.toString()
  );

  if (!isMember) {
    return next(new ErrorResponse('Access denied. You are not a member of this community', 403));
  }

  req.community = community;
  next();
});

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.errors[0].message,
    });
  }
};

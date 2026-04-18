import User from '../auth/auth.model.js';
import imagekit from '../../config/imagekit.js';
import ErrorResponse from '../../utils/errorResponse.js';

export const handleImageUpload = async (userId, fileBuffer, fileName) => {
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse('User not found', 404);

  const uploadResponse = await imagekit.upload({
    file: fileBuffer.toString('base64'),
    fileName: `profile_${userId}_${Date.now()}`,
    folder: '/xmentor/profiles',
  });

  if (user.profilePicId) {
    try {
      await imagekit.deleteFile(user.profilePicId);
    } catch (error) {
      console.error('Failed to delete old profile pic:', error.message);
    }
  }

  user.profilePic = uploadResponse.url;
  user.profilePicId = uploadResponse.fileId;
  await user.save();

  return uploadResponse.url;
};

export const updateProfile = async (userId, updateData) => {
  const flattenedData = {};
  
  const flatten = (obj, prefix = '') => {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        flatten(value, `${newKey}.`);
      } else {
        flattenData[newKey] = value;
      }
    });
  };

  flatten(updateData);

  const sensitiveFields = ['email', 'password', 'role', '_id'];
  sensitiveFields.forEach(field => delete flattenedData[field]);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: flattenedData },
    { new: true, runValidators: true }
  ).select('-password').lean();

  if (!updatedUser) throw new ErrorResponse('User not found', 404);
  return updatedUser;
};

export const getProfile = async (userId) => {
  const profile = await User.findById(userId).select('-password').lean();
  if (!profile) throw new ErrorResponse('Profile not found', 404);
  return profile;
};

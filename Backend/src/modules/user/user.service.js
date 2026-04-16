import User from '../auth/auth.model.js';
import imagekit from '../../config/imagekit.js';

export const handleImageUpload = async (userId, fileBuffer, fileName) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

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
    for (const key in obj) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
        flatten(obj[key], `${prefix}${key}.`);
      } else {
        flattenData[`${prefix}${key}`] = obj[key];
      }
    }
  };

  flatten(updateData);

  delete flattenedData.email;
  delete flattenedData.password;
  delete flattenedData.role;

  return await User.findByIdAndUpdate(
    userId,
    { $set: flattenedData },
    { new: true, runValidators: true }
  ).select('-password');
};

export const getProfile = async (userId) => {
  return await User.findById(userId).select('-password');
};

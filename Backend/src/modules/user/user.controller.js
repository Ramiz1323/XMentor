import * as userService from './user.service.js';

export const getMyProfile = async (req, res) => {
  try {
    const profile = await userService.getProfile(req.user.id);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const updatedProfile = await userService.updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, data: updatedProfile });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const imageUrl = await userService.handleImageUpload(
      req.user.id,
      req.file.buffer,
      req.file.originalname
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      url: imageUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

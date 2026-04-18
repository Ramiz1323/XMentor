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
  const profile = await User.findById(userId)
    .populate('students', 'name username profilePic')
    .populate('teachers', 'name username profilePic');
    
  if (!profile) throw new ErrorResponse('Profile not found', 404);

  // Retroactive username generation for legacy users
  if (!profile.username) {
    let baseUsername = profile.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    if (baseUsername.length < 3) baseUsername = 'user' + Math.floor(Math.random() * 1000);
    
    // Safety check for collisions
    const collision = await User.findOne({ username: baseUsername });
    profile.username = collision ? (baseUsername + Math.floor(Math.random() * 900) + 100) : baseUsername;
    await profile.save();
  }

  return profile.toObject ? profile.toObject() : profile;
};

export const linkStudentByUsername = async (teacherId, studentUsername) => {
  const teacher = await User.findById(teacherId);
  if (teacher.role !== 'TEACHER') throw new ErrorResponse('Only teachers can add students', 403);

  const student = await User.findOne({ username: studentUsername.toLowerCase() });
  if (!student) throw new ErrorResponse('Student not found with this username', 404);
  if (student.role !== 'STUDENT') throw new ErrorResponse('This user is not a student', 400);

  if (teacherId.toString() === student._id.toString()) {
    throw new ErrorResponse('You cannot add yourself', 400);
  }

  // Add mutual references
  if (!teacher.students.includes(student._id)) {
    teacher.students.push(student._id);
    await teacher.save();
  }

  if (!student.teachers.includes(teacher._id)) {
    student.teachers.push(teacher._id);
    await student.save();
  }

  return { studentId: student._id, name: student.name, username: student.username };
};

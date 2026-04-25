import User from '../auth/auth.model.js';
import imagekit from '../../config/imagekit.js';
import ErrorResponse from '../../utils/errorResponse.js';

export const handleImageUpload = async (userId, fileBuffer, fileName) => {
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse('User not found', 404);

  const uploadResponse = await imagekit.files.upload({
    file: fileBuffer.toString('base64'),
    fileName: `profile_${userId}_${Date.now()}`,
    folder: '/xmentor/profiles',
  });

  if (user.profilePicId) {
    try {
      await imagekit.files.delete(user.profilePicId);
    } catch (error) {
      console.error('Failed to delete old profile pic:', error.message);
    }
  }

  user.profilePic = uploadResponse.url;
  user.profilePicId = uploadResponse.fileId;
  await user.save();

  return user;
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
        flattenedData[newKey] = value;
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

  if (!profile.username) {
    let baseUsername = profile.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    if (baseUsername.length < 3) baseUsername = 'user' + Math.floor(Math.random() * 1000);
    
    // Atomic attempt to claim username via retry
    let attempts = 0;
    while (attempts < 5) {
      let candidate = attempts === 0 ? baseUsername : `${baseUsername}${Math.floor(Math.random() * 9000) + 1000}`;
      try {
        const updated = await User.findOneAndUpdate(
          { _id: profile._id, username: { $exists: false } },
          { $set: { username: candidate } },
          { new: true, runValidators: true }
        );
        if (updated) {
          profile.username = candidate;
          break;
        }
      } catch (error) {
        if (error.code === 11000) {
          attempts++;
        } else {
          throw error;
        }
      }
    }
  }

  return profile.toObject ? profile.toObject() : profile;
};

export const linkStudentByUsername = async (teacherId, studentUsername) => {
  const teacher = await User.findById(teacherId);
  if (!teacher) throw new ErrorResponse('Teacher profile not found', 404);
  if (teacher.role !== 'TEACHER') throw new ErrorResponse('Only teachers can add students', 403);

  const student = await User.findOne({ username: studentUsername.toLowerCase() });
  if (!student) throw new ErrorResponse('Student not found with this username', 404);
  if (student.role !== 'STUDENT') throw new ErrorResponse('This user is not a student', 400);

  if (teacherId.toString() === student._id.toString()) {
    throw new ErrorResponse('You cannot add yourself', 400);
  }

  // Atomic mutual update using $addToSet
  await User.updateOne(
    { _id: teacherId },
    { $addToSet: { students: student._id } }
  );

  await User.updateOne(
    { _id: student._id },
    { $addToSet: { teachers: teacherId } }
  );

  return { studentId: student._id, name: student.name, username: student.username };
};

export const getDashboardStats = async (userId, role) => {
  const [
    mcqStats,
    doubtStats,
    communityStats
  ] = await Promise.all([
    // MCQ Stats
    (async () => {
      const { MCQResult } = await import('../mcq/mcq.model.js');
      const results = await MCQResult.find({ studentId: userId });
      const totalTests = results.length;
      const avgScore = totalTests > 0 
        ? (results.reduce((acc, r) => acc + (r.score / r.total), 0) / totalTests) * 100 
        : 0;
      return { totalTests, avgScore: Math.round(avgScore) };
    })(),
    
    // Doubt Stats
    (async () => {
      const Doubt = (await import('../doubt/doubt.model.js')).default;
      const query = role === 'TEACHER' ? { teacher: userId } : { student: userId };
      const doubts = await Doubt.find(query);
      const totalDoubts = doubts.length;
      const resolvedDoubts = doubts.filter(d => d.status === 'RESOLVED').length;
      return { totalDoubts, resolvedDoubts };
    })(),

    // Community Stats
    (async () => {
      const Community = (await import('../community/community.model.js')).default;
      const communities = await Community.find({ 'members.user': userId });
      return { joinedCommunities: communities.length };
    })()
  ]);

  return {
    mcq: mcqStats,
    doubts: doubtStats,
    communities: communityStats
  };
};

export const getGlobalLeaderboard = async () => {
  const { MCQResult } = await import('../mcq/mcq.model.js');
  
  // Aggregate MCQ results for all students
  const leaderboardData = await MCQResult.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'studentId',
        foreignField: '_id',
        as: 'studentInfo'
      }
    },
    { $unwind: '$studentInfo' },
    { $match: { 'studentInfo.role': 'STUDENT' } },
    {
      $group: {
        _id: '$studentId',
        totalTests: { $sum: 1 },
        totalScore: { $sum: '$score' },
        totalPossible: { $sum: '$total' },
        avgAccuracy: { $avg: { $divide: ['$score', '$total'] } },
        studentName: { $first: '$studentInfo.name' },
        studentUsername: { $first: '$studentInfo.username' },
        studentPic: { $first: '$studentInfo.profilePic' }
      }
    },
    {
      $project: {
        studentId: '$_id',
        name: '$studentName',
        username: '$studentUsername',
        profilePic: '$studentPic',
        totalTests: 1,
        avgAccuracy: { $multiply: ['$avgAccuracy', 100] },
        // A weighted score for ranking: (Accuracy * 0.8) + (Participation * 0.2)
        rankingScore: { 
          $add: [
            { $multiply: ['$avgAccuracy', 80] }, 
            { $multiply: [{ $min: ['$totalTests', 10] }, 2] } // Cap participation bonus
          ]
        }
      }
    },
    { $sort: { rankingScore: -1, totalTests: -1 } },
    { $limit: 20 }
  ]);

  return leaderboardData.map((entry, index) => ({
    rank: index + 1,
    id: entry.studentId,
    name: entry.name,
    username: entry.username,
    profilePic: entry.profilePic,
    totalTests: entry.totalTests,
    accuracy: Math.round(entry.avgAccuracy),
    score: Math.round(entry.rankingScore)
  }));
};

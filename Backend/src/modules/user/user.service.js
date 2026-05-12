import mongoose from 'mongoose';
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

  const sensitiveFields = ['email', 'password', 'role', '_id', 'name', 'username'];
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

export const getGlobalLeaderboard = async (requestingUserId) => {
  const { MCQResult } = await import('../mcq/mcq.model.js');
  const { SubjectiveResult } = await import('../subjective/subjective.model.js');
  
  // 0. Identify the "Recruitment Circle"
  const currentUser = await User.findById(requestingUserId).select('role students teachers').lean();
  if (!currentUser) throw new ErrorResponse('User not found', 404);

  let targetStudentIds = [];

  if (currentUser.role === 'TEACHER') {
    // Teachers only see students they have recruited
    targetStudentIds = currentUser.students || [];
  } else {
    // Students see fellow recruits of their teachers
    const teachers = await User.find({ _id: { $in: currentUser.teachers || [] } }).select('students').lean();
    const classmateIds = new Set();
    
    // Add self to the list
    classmateIds.add(requestingUserId.toString());
    
    // Add classmates from all linked teachers
    teachers.forEach(t => {
      (t.students || []).forEach(sId => classmateIds.add(sId.toString()));
    });
    
    targetStudentIds = Array.from(classmateIds).map(id => new mongoose.Types.ObjectId(id));
  }

  if (targetStudentIds.length === 0) return [];

  // 1. Fetch filtered student profiles
  const students = await User.find({ _id: { $in: targetStudentIds } })
    .select('name username profilePic')
    .lean();

  const mergedMap = new Map();
  students.forEach(s => {
    mergedMap.set(s._id.toString(), {
      studentId: s._id,
      name: s.name,
      username: s.username,
      profilePic: s.profilePic,
      totalTests: 0,
      totalScore: 0,
      totalPossible: 0
    });
  });

  // 2. Aggregate MCQ results (Modern + Legacy) for target circle
  const mcqResults = await MCQResult.aggregate([
    {
      $match: {
        studentId: { $in: targetStudentIds },
        $or: [
          { status: 'COMPLETED' },
          { status: { $exists: false } }
        ]
      }
    },
    {
      $group: {
        _id: '$studentId',
        totalTests: { $sum: 1 },
        totalScore: { $sum: '$score' },
        totalPossible: { $sum: '$total' }
      }
    }
  ]);

  mcqResults.forEach(m => {
    const idStr = m._id.toString();
    if (mergedMap.has(idStr)) {
      const entry = mergedMap.get(idStr);
      entry.totalTests += m.totalTests;
      entry.totalScore += m.totalScore;
      entry.totalPossible += m.totalPossible;
    }
  });

  // 3. Aggregate Subjective results (Graded + Legacy with marks) for target circle
  const subjectiveResults = await SubjectiveResult.aggregate([
    { 
      $match: { 
        studentId: { $in: targetStudentIds },
        $or: [
          { status: 'GRADED' },
          { marksObtained: { $gt: 0 } }
        ] 
      } 
    },
    {
      $group: {
        _id: '$studentId',
        totalTests: { $sum: 1 },
        totalScore: { $sum: '$marksObtained' },
        totalPossible: { $sum: '$maxMarks' }
      }
    }
  ]);

  subjectiveResults.forEach(s => {
    const idStr = s._id.toString();
    if (mergedMap.has(idStr)) {
      const entry = mergedMap.get(idStr);
      entry.totalTests += s.totalTests;
      entry.totalScore += s.totalScore;
      entry.totalPossible += s.totalPossible;
    }
  });

  // 4. Final tactical ranking calculation
  const leaderboardData = Array.from(mergedMap.values())
    .filter(entry => entry.totalTests > 0)
    .map(entry => {
      const avgAccuracy = entry.totalPossible > 0 ? (entry.totalScore / entry.totalPossible) * 100 : 0;
      const participationScore = Math.min(Math.log10(entry.totalTests + 1) * 30, 25);
      const rankingScore = (avgAccuracy * 0.75) + participationScore;

      return {
        ...entry,
        accuracy: Math.round(avgAccuracy),
        score: Math.round(rankingScore)
      };
    });

  return leaderboardData
    .sort((a, b) => b.score - a.score || b.totalTests - a.totalTests)
    .slice(0, 50) // Increased slightly for class size
    .map((entry, index) => ({
      rank: index + 1,
      id: entry.studentId,
      name: entry.name,
      username: entry.username,
      profilePic: entry.profilePic,
      totalTests: entry.totalTests,
      accuracy: entry.accuracy,
      score: entry.score
    }));
};

export const updatePushSubscription = async (userId, subscription) => {
  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse('User not found', 404);

  const exists = user.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
  if (exists) return user;

  user.pushSubscriptions.push(subscription);
  if (user.pushSubscriptions.length > 3) {
    user.pushSubscriptions.shift();
  }

  await user.save();
  return user;
};

export const fetchPendingTeachers = async () => {
  return await User.find({ role: 'TEACHER', isVerified: false })
    .select('name email username phoneNumber createdAt')
    .sort({ createdAt: -1 })
    .lean();
};

export const approveTeacher = async (teacherId) => {
  const teacher = await User.findByIdAndUpdate(
    teacherId,
    { $set: { isVerified: true } },
    { new: true, runValidators: true }
  ).select('name email isVerified');

  if (!teacher) throw new ErrorResponse('Teacher not found', 404);
  return teacher;
};

import asyncHandler from '../../utils/asyncHandler.js';
import * as mcqService from './mcq.service.js';
import { notifyUser } from '../../utils/push.utils.js';
import User from '../auth/auth.model.js';

export const create = asyncHandler(async (req, res) => {
  const test = await mcqService.createTest(req.body, req.user._id);
  
  // 📡 NOTIFICATION SYSTEM
  const io = req.app.get('socketio');
  const payload = {
    id: test._id,
    title: test.title,
    subject: test.subject,
    mentorName: req.user.name,
    type: 'TASK_ALERT'
  };

  // 1. Socket.io (Active users)
  if (io) {
    if (test.communityId) {
      io.to(test.communityId.toString()).emit('new_task', payload);
    } else if (test.assignedStudents && test.assignedStudents.length > 0) {
      test.assignedStudents.forEach(studentId => {
        io.to(studentId.toString()).emit('new_task', payload);
      });
    }
  }

  // 2. Web Push (Mobile/Offline users)
  try {
    let targetUsers = [];
    if (test.communityId) {
      // Find all members of the community
      const Community = (await import('../community/community.model.js')).default;
      const community = await Community.findById(test.communityId).select('members');
      if (community) {
        const memberIds = community.members.map(m => m.user);
        targetUsers = await User.find({ _id: { $in: memberIds } });
      }
    } else if (test.assignedStudents && test.assignedStudents.length > 0) {
      targetUsers = await User.find({ _id: { $in: test.assignedStudents } });
    }

    // Broadcast Push Signal
    targetUsers.forEach(user => {
      notifyUser(user, {
        title: `INCOMING TRANSMISSION: Mentor ${req.user.name}`,
        body: `New Tactical Assessment detected in ${test.subject}: ${test.title}`,
        url: `/mcq/${test._id}`
      });
    });
  } catch (pushErr) {
    console.error('[Notification] Push broadcast failed:', pushErr.message);
  }

  res.status(201).json({
    success: true,
    message: 'Test created successfully',
    data: test,
  });
});

export const getById = asyncHandler(async (req, res) => {
  const result = await mcqService.getTestForStudent(req.params.id, req.user._id);
  
  res.status(200).json({
    success: true,
    message: result.isSubmitted ? 'Review mode' : 'Attempt mode',
    data: result,
  });
});

export const submit = asyncHandler(async (req, res) => {
  const { answers, timeTaken } = req.body;
  const result = await mcqService.submitTest(req.params.id, req.user._id, answers, timeTaken);
  
  res.status(201).json({
    success: true,
    message: 'Test submitted successfully',
    data: result,
  });
});

export const getByCommunity = asyncHandler(async (req, res) => {
  const tests = await mcqService.getTestsByCommunity(req.params.communityId);
  
  res.status(200).json({
    success: true,
    message: 'Tests retrieved successfully',
    data: tests,
  });
});

export const getMine = asyncHandler(async (req, res) => {
  const tests = await mcqService.getAssignedTests(req.user._id);
  
  res.status(200).json({
    success: true,
    message: 'Personal tests retrieved successfully',
    data: tests,
  });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await mcqService.getTestAnalytics(req.params.id, req.user._id);
  
  res.status(200).json({
    success: true,
    message: 'Analytics retrieved successfully',
    data: analytics,
  });
});
export const getOverview = asyncHandler(async (req, res) => {
  const overview = await mcqService.getTeacherOverview(req.user._id);
  
  res.status(200).json({
    success: true,
    message: 'Teacher overview retrieved successfully',
    data: overview,
  });
});
export const remove = asyncHandler(async (req, res) => {
  await mcqService.deleteTest(req.params.id, req.user._id);
  
  res.status(200).json({
    success: true,
    message: 'Test and associated results deleted successfully',
  });
});

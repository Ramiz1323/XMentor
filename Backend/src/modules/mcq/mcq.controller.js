import asyncHandler from '../../utils/asyncHandler.js';
import * as mcqService from './mcq.service.js';

export const create = asyncHandler(async (req, res) => {
  const test = await mcqService.createTest(req.body, req.user._id);
  
  // HUD Notification Broadcast
  const io = req.app.get('socketio');
  if (io) {
    const payload = {
      id: test._id,
      title: test.title,
      subject: test.subject,
      mentorName: req.user.name,
      type: 'TASK_ALERT'
    };

    if (test.communityId) {
      // Notify entire community
      io.to(test.communityId.toString()).emit('new_task', payload);
    } else if (test.assignedStudents && test.assignedStudents.length > 0) {
      // Notify specific students
      test.assignedStudents.forEach(studentId => {
        io.to(studentId.toString()).emit('new_task', payload);
      });
    }
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

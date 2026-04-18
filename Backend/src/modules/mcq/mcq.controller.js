import asyncHandler from '../../utils/asyncHandler.js';
import * as mcqService from './mcq.service.js';

export const create = asyncHandler(async (req, res) => {
  const test = await mcqService.createTest(req.body, req.user._id);
  
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

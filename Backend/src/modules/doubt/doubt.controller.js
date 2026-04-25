import asyncHandler from '../../utils/asyncHandler.js';
import * as doubtService from './doubt.service.js';

export const ask = asyncHandler(async (req, res) => {
  let attachments = [];
  
  if (req.file) {
    const imageUrl = await doubtService.handleDoubtImage(req.file.buffer, req.file.originalname);
    attachments.push(imageUrl);
  }

  const { teacherId, title, description, subject, priority } = req.body;

  const result = await doubtService.createDoubt(req.user._id, {
    teacherId,
    title,
    description,
    subject,
    priority,
    attachments
  });
  res.status(201).json({ success: true, message: 'Doubt submitted successfully', data: result });
});

export const getAll = asyncHandler(async (req, res) => {
  const doubts = await doubtService.getDoubts(req.user._id, req.user.role, req.query);
  res.status(200).json({ success: true, count: doubts.length, data: doubts });
});

export const getById = asyncHandler(async (req, res) => {
  const doubt = await doubtService.getDoubtById(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: doubt });
});

export const resolve = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ success: false, message: 'Answer content is required' });

  const result = await doubtService.resolveDoubt(req.params.id, req.user._id, content);
  res.status(200).json({ success: true, message: 'Doubt resolved', data: result });
});

export const remove = asyncHandler(async (req, res) => {
  await doubtService.deleteDoubt(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Doubt removed' });
});

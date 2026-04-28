import { SubjectiveTest, SubjectiveResult } from './subjective.model.js';
import ErrorResponse from '../../utils/errorResponse.js';

export const createSubjectiveTest = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const test = await SubjectiveTest.create(req.body);
    res.status(201).json({ success: true, data: test });
  } catch (err) {
    next(err);
  }
};

export const getSubjectiveTests = async (req, res, next) => {
  try {
    const isTeacher = req.user.role === 'TEACHER';
    const query = isTeacher 
      ? { createdBy: req.user.id } 
      : { $or: [{ assignedStudents: req.user.id }, { assignedStudents: { $size: 0 } }] };

    const tests = await SubjectiveTest.find(query).populate('createdBy', 'name username').sort('-createdAt');
    
    // For students, attach submission status to each test
    let data = tests;
    if (!isTeacher) {
      const submissions = await SubjectiveResult.find({ studentId: req.user.id });
      data = tests.map(test => {
        const submission = submissions.find(s => s.testId.toString() === test._id.toString());
        return { ...test.toObject(), submission };
      });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getSubjectiveTest = async (req, res, next) => {
  try {
    const test = await SubjectiveTest.findById(req.params.id).populate('createdBy', 'name username');
    if (!test) return next(new ErrorResponse('Test not found', 404));

    // Check if student already submitted
    const submission = await SubjectiveResult.findOne({ 
      testId: req.params.id, 
      studentId: req.user.id 
    });

    res.status(200).json({ success: true, data: test, submission });
  } catch (err) {
    next(err);
  }
};

export const submitSubjectiveTest = async (req, res, next) => {
  try {
    const test = await SubjectiveTest.findById(req.params.id);
    if (!test) return next(new ErrorResponse('Test not found', 404));

    const submission = await SubjectiveResult.create({
      testId: test._id,
      studentId: req.user.id,
      maxMarks: test.maxMarks,
      status: 'PENDING'
    });

    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

export const getPendingSubmissions = async (req, res, next) => {
  try {
    // Only teachers can see their test submissions
    const tests = await SubjectiveTest.find({ createdBy: req.user.id });
    const testIds = tests.map(t => t._id);

    const submissions = await SubjectiveResult.find({ 
      testId: { $in: testIds },
      status: 'PENDING'
    }).populate('studentId', 'name username profilePic')
      .populate('testId', 'title subject questions');

    res.status(200).json({ success: true, data: submissions });
  } catch (err) {
    next(err);
  }
};

export const gradeSubmission = async (req, res, next) => {
  try {
    const { marksObtained } = req.body;
    const submission = await SubjectiveResult.findById(req.params.id).populate('testId');
    
    if (!submission) return next(new ErrorResponse('Submission not found', 404));
    
    // Check if user is the creator of the test
    if (submission.testId.createdBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to grade this test', 403));
    }

    submission.marksObtained = marksObtained;
    submission.status = 'GRADED';
    submission.gradedAt = Date.now();
    await submission.save();

    res.status(200).json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};
export const deleteSubjectiveTest = async (req, res, next) => {
  try {
    const test = await SubjectiveTest.findById(req.params.id);
    if (!test) return next(new ErrorResponse('Task not found', 404));

    // Security check: Only the creator can delete
    if (test.createdBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Security Breach: Unauthorized deletion attempt', 403));
    }

    // Wipe all associated tactical results first
    await SubjectiveResult.deleteMany({ testId: req.params.id });
    
    // Decommission the task
    await test.deleteOne();

    res.status(200).json({ success: true, message: 'Task de-established' });
  } catch (err) {
    next(err);
  }
};

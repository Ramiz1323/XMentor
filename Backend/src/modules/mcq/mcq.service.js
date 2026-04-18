import { MCQTest, MCQResult } from './mcq.model.js';
import ErrorResponse from '../../utils/errorResponse.js';

export const createTest = async (testData, teacherId) => {
  const { title, subject, communityId, duration, questions: inputQuestions } = testData;

  // Safe check for questions array
  const questions = Array.isArray(inputQuestions) ? inputQuestions : [];

  const test = await MCQTest.create({
    title,
    subject,
    communityId,
    duration,
    questions,
    totalQuestions: questions.length,
    createdBy: teacherId,
  });

  return test;
};

export const getTestForStudent = async (testId, studentId) => {
  const test = await MCQTest.findById(testId).lean();
  if (!test) throw new ErrorResponse('Test not found', 404);

  const result = await MCQResult.findOne({ testId, studentId }).lean();

  if (!result) {
    const sanitizedQuestions = test.questions.map(q => ({
      _id: q._id,
      q: q.q,
      options: q.options
    }));

    return {
      ...test,
      questions: sanitizedQuestions,
      isSubmitted: false
    };
  }

  return {
    ...test,
    result,
    isSubmitted: true
  };
};

export const submitTest = async (testId, studentId, studentAnswers, timeTaken) => {
  const test = await MCQTest.findById(testId);
  if (!test) throw new ErrorResponse('Test not found', 404);

  if (studentAnswers.length !== test.totalQuestions) {
    throw new ErrorResponse(`Expected ${test.totalQuestions} answers, but received ${studentAnswers.length}`, 400);
  }

  let score = 0;
  test.questions.forEach((question, index) => {
    if (studentAnswers[index] === question.correct) {
      score++;
    }
  });

  try {
    const result = await MCQResult.create({
      testId,
      studentId,
      score,
      total: test.totalQuestions,
      timeTaken,
      answers: studentAnswers
    });

    return result;
  } catch (error) {
    // Catch MongoDB duplicate key error (E11000) to solve TOCTOU race condition
    if (error.code === 11000) {
      throw new ErrorResponse('You have already submitted this test', 400);
    }
    throw error;
  }
};

export const getTestsByCommunity = async (communityId) => {
  return await MCQTest.find({ communityId })
    .select('title subject totalQuestions duration createdAt')
    .lean();
};

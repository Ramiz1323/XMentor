import { MCQTest, MCQResult } from './mcq.model.js';
import ErrorResponse from '../../utils/errorResponse.js';

export const createTest = async (testData, teacherId) => {
  const { 
    title, 
    subject, 
    communityId, 
    duration, 
    hasTimer = true, 
    deadline,
    language = 'english',
    assignedStudents = [], 
    questions: inputQuestions 
  } = testData;

  const questions = Array.isArray(inputQuestions) ? inputQuestions : [];

  const test = await MCQTest.create({
    title,
    subject,
    communityId,
    duration,
    hasTimer,
    deadline,
    language,
    assignedStudents,
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

export const deleteTest = async (testId, teacherId) => {
  const test = await MCQTest.findById(testId);
  if (!test) throw new ErrorResponse('Test not found', 404);

  if (test.createdBy.toString() !== teacherId.toString()) {
    throw new ErrorResponse('Unauthorized: Only creator can delete this test', 403);
  }

  await MCQResult.deleteMany({ testId });
  await MCQTest.findByIdAndDelete(testId);
  return { message: 'Test deleted successfully' };
};

export const getTestsByCommunity = async (communityId) => {
  return await MCQTest.find({ communityId })
    .select('title subject totalQuestions duration hasTimer deadline language createdAt')
    .lean();
};

export const getAssignedTests = async (userId) => {
  // Find tests created by teacher OR tests where student is in assignedStudents
  const tests = await MCQTest.find({
    $or: [
      { createdBy: userId },
      { assignedStudents: userId }
    ]
  })
  .select('title subject totalQuestions duration hasTimer deadline language createdAt createdBy')
  .populate('createdBy', 'name profilePic')
  .sort({ createdAt: -1 })
  .lean();

  // For each test, check if the current user has already submitted a result
  const results = await MCQResult.find({ 
    studentId: userId,
    testId: { $in: tests.map(t => t._id) }
  }).lean();

  const resultsMap = results.reduce((acc, r) => {
    acc[r.testId.toString()] = r;
    return acc;
  }, {});

  return tests.map(test => {
    const userResult = resultsMap[test._id.toString()];
    return {
      ...test,
      isSubmitted: !!userResult,
      result: userResult || null
    };
  });
};

export const getTestAnalytics = async (testId, teacherId) => {
  const test = await MCQTest.findById(testId);
  if (!test) throw new ErrorResponse('Test not found', 404);

  // Verification: Only the creator can see full analytics
  if (test.createdBy.toString() !== teacherId.toString()) {
    throw new ErrorResponse('Unauthorized: High-level access required', 403);
  }

  const results = await MCQResult.find({ testId })
    .populate('studentId', 'name username profilePic')
    .sort({ score: -1, timeTaken: 1 })
    .lean();

  return {
    test,
    results,
    stats: {
      totalAttempts: results.length,
      avgScore: results.length > 0 
        ? parseFloat((results.reduce((acc, curr) => acc + curr.score, 0) / results.length).toFixed(1)) 
        : 0
    }
  };
};

export const getTeacherOverview = async (teacherId) => {
  // 1. Get teacher's tests
  const tests = await MCQTest.find({ createdBy: teacherId })
    .select('title subject totalQuestions assignedStudents createdAt')
    .sort({ createdAt: -1 })
    .lean();

  // 2. Get teacher's students
  const User = MCQTest.db.model('User');
  const teacher = await User.findById(teacherId)
    .populate('students', 'name username profilePic')
    .lean();

  if (!teacher) throw new ErrorResponse('Teacher not found', 404);

  const students = teacher.students || [];

  // 3. Get all results for these tests
  const testIds = tests.map(t => t._id);
  const allResults = await MCQResult.find({ 
    testId: { $in: testIds } 
  }).lean();

  // Map results to student-wise view
  const studentStats = students.map(student => {
    const studentResults = allResults.filter(r => r.studentId.toString() === student._id.toString());
    const completedTestIds = new Set(studentResults.map(r => r.testId.toString()));
    
    // Find tests where student is assigned but hasn't completed
    const pendingTasks = tests.filter(test => 
      test.assignedStudents.map(id => id.toString()).includes(student._id.toString()) &&
      !completedTestIds.has(test._id.toString())
    );

    return {
      student,
      completedCount: studentResults.length,
      pendingCount: pendingTasks.length,
      pendingTasks: pendingTasks.map(t => ({ _id: t._id, title: t.title, subject: t.subject })),
      results: studentResults.map(r => {
        const test = tests.find(t => t._id.toString() === r.testId.toString());
        return {
          ...r,
          testTitle: test?.title || 'Unknown Test',
          subject: test?.subject || 'OTHERS'
        };
      })
    };
  });

  return {
    tests,
    studentStats
  };
};

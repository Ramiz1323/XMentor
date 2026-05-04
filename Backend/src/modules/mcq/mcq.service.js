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
    pauseLimit = 0,
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
    pauseLimit: parseInt(pauseLimit) || 0,
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

  if (!result || result.status === 'IN_PROGRESS') {
    const sanitizedQuestions = test.questions.map(q => ({
      _id: q._id,
      q: q.q,
      options: q.options
    }));

    return {
      ...test,
      questions: sanitizedQuestions,
      isSubmitted: result ? (!result.status || result.status === 'COMPLETED') : false,
      progress: result || null
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
    // If studentAnswers[index] is -1 or null, it won't match question.correct (0-3)
    if (studentAnswers[index] === question.correct) {
      score++;
    }
  });

  try {
    // Find if there's an existing in-progress result
    let result = await MCQResult.findOne({ testId, studentId });

    if (result) {
      if (result.status === 'COMPLETED') {
        throw new ErrorResponse('You have already submitted this test', 400);
      }

      // Update existing result
      result.score = score;
      result.timeTaken = timeTaken;
      result.answers = studentAnswers;
      result.status = 'COMPLETED';
      await result.save();
    } else {
      // Create new result
      result = await MCQResult.create({
        testId,
        studentId,
        score,
        total: test.totalQuestions,
        timeTaken,
        answers: studentAnswers,
        status: 'COMPLETED'
      });
    }

    return result;
  } catch (error) {
    if (error.code === 11000) {
      throw new ErrorResponse('You have already submitted this test', 400);
    }
    throw error;
  }
};

export const pauseTest = async (testId, studentId, pauseData) => {
  const { answers, timeTaken, currentQuestionIndex, timeLeft } = pauseData;
  const test = await MCQTest.findById(testId);
  if (!test) throw new ErrorResponse('Test not found', 404);

  let result = await MCQResult.findOne({ testId, studentId });

  if (result) {
    if (result.status === 'COMPLETED') {
      throw new ErrorResponse('Cannot pause a completed test', 400);
    }

    if (result.pausesUsed >= test.pauseLimit && test.pauseLimit > 0) {
      throw new ErrorResponse('Maximum pause limit reached', 400);
    }

    result.answers = answers;
    result.timeTaken = timeTaken;
    result.currentQuestionIndex = currentQuestionIndex;
    result.timeLeft = timeLeft;
    result.pausesUsed += 1;
    result.status = 'IN_PROGRESS';
    await result.save();
  } else {
    if (test.pauseLimit === 0) {
      throw new ErrorResponse('Pausing is not allowed for this test', 400);
    }

    result = await MCQResult.create({
      testId,
      studentId,
      score: 0, // Placeholder
      total: test.totalQuestions,
      timeTaken,
      answers,
      currentQuestionIndex,
      timeLeft,
      pausesUsed: 1,
      status: 'IN_PROGRESS'
    });
  }

  return result;
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
      isSubmitted: userResult ? (!userResult.status || userResult.status === 'COMPLETED') : false,
      isPaused: userResult ? userResult.status === 'IN_PROGRESS' : false,
      result: userResult || null
    };
  });
};

export const getTestAnalytics = async (testId, teacherId) => {
  const test = await MCQTest.findById(testId).populate('assignedStudents', 'name username profilePic');
  if (!test) throw new ErrorResponse('Test not found', 404);

  // Verification: Only the creator can see full analytics
  if (test.createdBy.toString() !== teacherId.toString()) {
    throw new ErrorResponse('Unauthorized: High-level access required', 403);
  }

  const results = await MCQResult.find({ testId })
    .populate('studentId', 'name username profilePic')
    .sort({ score: -1, timeTaken: 1 })
    .lean();

  // Find students who are assigned but haven't completed
  const completedStudentIds = new Set(results.map(r => r.studentId._id.toString()));
  const pendingStudents = test.assignedStudents.filter(student =>
    !completedStudentIds.has(student._id.toString())
  );

  return {
    test,
    results,
    pendingStudents,
    stats: {
      totalAttempts: results.length,
      totalAssigned: test.assignedStudents.length,
      avgScore: results.length > 0
        ? parseFloat((results.reduce((acc, curr) => acc + curr.score, 0) / results.length).toFixed(1))
        : 0
    }
  };
};

export const assignTest = async (testId, teacherId, studentIds) => {
  const test = await MCQTest.findById(testId);
  if (!test) throw new ErrorResponse('Test not found', 404);

  if (test.createdBy.toString() !== teacherId.toString()) {
    throw new ErrorResponse('Unauthorized: Only creator can assign this test', 403);
  }

  // Filter out students already assigned
  const currentAssigned = test.assignedStudents.map(id => id.toString());
  const newAssignments = studentIds.filter(id => !currentAssigned.includes(id));

  if (newAssignments.length === 0) {
    return { test, newAssignments: [] };
  }

  test.assignedStudents.push(...newAssignments);
  await test.save();

  return { test, newAssignments };
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
    const sIdStr = student._id.toString();
    const studentResults = allResults.filter(r => r.studentId.toString() === sIdStr);
    
    // Legacy support: Include results where status is COMPLETED or missing
    const completedResults = studentResults.filter(r => !r.status || r.status === 'COMPLETED');
    const completedTestIds = new Set(completedResults.map(r => r.testId.toString()));

    // Find tests where student is assigned but hasn't completed
    const pendingTasks = tests.filter(test => {
      const isAssigned = test.assignedStudents.some(id => id.toString() === sIdStr);
      const isCompleted = completedTestIds.has(test._id.toString());
      return isAssigned && !isCompleted;
    });

    // Map all completed results for display
    const sortedCompletedResults = completedResults
      .map(r => {
        const test = tests.find(t => t._id.toString() === r.testId.toString());
        return {
          ...r,
          testTitle: test?.title || 'Unknown Test',
          subject: test?.subject || 'OTHERS'
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      student,
      completedCount: sortedCompletedResults.length,
      pendingCount: pendingTasks.length,
      pendingTasks: pendingTasks.map(t => ({ _id: t._id, title: t.title, subject: t.subject })),
      results: sortedCompletedResults,
      lastSubmissionAt: sortedCompletedResults.length > 0 ? sortedCompletedResults[0].createdAt : null
    };
  });

  // Sort overall studentStats by lastSubmissionAt (most recent first)
  // Students with no submissions go to the bottom
  studentStats.sort((a, b) => {
    if (!a.lastSubmissionAt && !b.lastSubmissionAt) return 0;
    if (!a.lastSubmissionAt) return 1;
    if (!b.lastSubmissionAt) return -1;
    return new Date(b.lastSubmissionAt) - new Date(a.lastSubmissionAt);
  });

  return {
    tests,
    studentStats
  };
};

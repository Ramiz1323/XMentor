import { MCQTest, MCQResult } from './mcq.model.js';
import ErrorResponse from '../../utils/errorResponse.js';
import { deterministicShuffle } from '../../utils/shuffle.js';

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

  const seed = studentId.toString() + testId.toString();
  const shuffledQuestions = deterministicShuffle(test.questions, seed);

  if (!result || result.status === 'IN_PROGRESS') {
    const sanitizedQuestions = shuffledQuestions.map(q => ({
      _id: q._id,
      q: q.q,
      options: q.options
    }));

    // If there is progress, re-map the answers to the shuffled order
    let progress = null;
    if (result) {
      const indices = Array.from(Array(test.questions.length).keys());
      const shuffledIndices = deterministicShuffle(indices, seed);
      
      const shuffledAnswers = new Array(test.questions.length).fill(-1);
      shuffledIndices.forEach((originalIdx, currentIdx) => {
        shuffledAnswers[currentIdx] = result.answers[originalIdx] !== undefined ? result.answers[originalIdx] : -1;
      });

      progress = {
        ...result,
        answers: shuffledAnswers
      };
    }

    return {
      ...test,
      questions: sanitizedQuestions,
      isSubmitted: result ? (!result.status || result.status === 'COMPLETED') : false,
      progress
    };
  }

  const indices = Array.from(Array(test.questions.length).keys());
  const shuffledIndices = deterministicShuffle(indices, seed);
  const shuffledAnswers = new Array(test.questions.length).fill(-1);
  shuffledIndices.forEach((originalIdx, currentIdx) => {
    shuffledAnswers[currentIdx] = result.answers[originalIdx] !== undefined ? result.answers[originalIdx] : -1;
  });

  return {
    ...test,
    questions: shuffledQuestions,
    result: {
      ...result,
      answers: shuffledAnswers
    },
    isSubmitted: true
  };
};

export const submitTest = async (testId, studentId, studentAnswers, timeTaken) => {
  const test = await MCQTest.findById(testId);
  if (!test) throw new ErrorResponse('Test not found', 404);

  if (studentAnswers.length !== test.totalQuestions) {
    throw new ErrorResponse(`Expected ${test.totalQuestions} answers, but received ${studentAnswers.length}`, 400);
  }

  // Use the exact same seed to reconstruct the student's question order
  const seed = studentId.toString() + testId.toString();
  const shuffledQuestions = deterministicShuffle(test.questions, seed);

  let score = 0;
  shuffledQuestions.forEach((question, index) => {
    if (studentAnswers[index] === question.correct) {
      score++;
    }
  });

  // Map answers back to original indices before storing in DB
  const indices = Array.from(Array(test.questions.length).keys());
  const shuffledIndices = deterministicShuffle(indices, seed);
  const unShuffledAnswers = new Array(test.questions.length).fill(-1);
  shuffledIndices.forEach((originalIdx, currentIdx) => {
    unShuffledAnswers[originalIdx] = studentAnswers[currentIdx];
  });

  try {
    let result = await MCQResult.findOne({ testId, studentId });

    if (result) {
      if (result.status === 'COMPLETED') {
        throw new ErrorResponse('You have already submitted this test', 400);
      }

      result.score = score;
      result.timeTaken = timeTaken;
      result.answers = unShuffledAnswers;
      result.status = 'COMPLETED';
      result.shuffleSeed = seed;
      await result.save();
    } else {
      result = await MCQResult.create({
        testId,
        studentId,
        score,
        total: test.totalQuestions,
        timeTaken,
        answers: unShuffledAnswers,
        status: 'COMPLETED',
        shuffleSeed: seed
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

  const seed = studentId.toString() + testId.toString();
  const indices = Array.from(Array(test.questions.length).keys());
  const shuffledIndices = deterministicShuffle(indices, seed);
  const unShuffledAnswers = new Array(test.questions.length).fill(-1);
  shuffledIndices.forEach((originalIdx, currentIdx) => {
    unShuffledAnswers[originalIdx] = answers[currentIdx];
  });

  let result = await MCQResult.findOne({ testId, studentId });

  if (result) {
    if (result.status === 'COMPLETED') {
      throw new ErrorResponse('Cannot pause a completed test', 400);
    }

    if (result.pausesUsed >= test.pauseLimit && test.pauseLimit > 0) {
      throw new ErrorResponse('Maximum pause limit reached', 400);
    }

    result.answers = unShuffledAnswers;
    result.timeTaken = timeTaken;
    result.currentQuestionIndex = currentQuestionIndex;
    result.timeLeft = timeLeft;
    result.pausesUsed += 1;
    result.status = 'IN_PROGRESS';
    result.shuffleSeed = seed;
    await result.save();
  } else {
    if (test.pauseLimit === 0) {
      throw new ErrorResponse('Pausing is not allowed for this test', 400);
    }

    result = await MCQResult.create({
      testId,
      studentId,
      score: 0,
      total: test.totalQuestions,
      timeTaken,
      answers: unShuffledAnswers,
      currentQuestionIndex,
      timeLeft,
      pausesUsed: 1,
      status: 'IN_PROGRESS',
      shuffleSeed: seed
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

export const getAssignedTests = async (userId, query = {}) => {
  const { page = 1, limit = 10, search = '', subject = 'ALL', status = 'ALL' } = query;
  const skip = (page - 1) * limit;

  // Build match stage
  const match = {
    $or: [
      { createdBy: userId },
      { assignedStudents: userId }
    ]
  };

  if (search) {
    match.title = { $regex: search, $options: 'i' };
  }

  if (subject !== 'ALL') {
    match.subject = subject;
  }

  // Use aggregation to join with results for status filtering
  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'mcqresults',
        let: { testId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$testId', '$$testId'] },
                  { $eq: ['$studentId', userId] }
                ]
              }
            }
          }
        ],
        as: 'userResult'
      }
    },
    {
      $addFields: {
        result: { $arrayElemAt: ['$userResult', 0] }
      }
    },
    {
      $addFields: {
        isSubmitted: {
          $cond: {
            if: { $and: ['$result', { $or: [{ $eq: ['$result.status', 'COMPLETED'] }, { $not: ['$result.status'] }] }] },
            then: true,
            else: false
          }
        },
        isPaused: {
          $cond: {
            if: { $eq: ['$result.status', 'IN_PROGRESS'] },
            then: true,
            else: false
          }
        }
      }
    }
  ];

  // Apply status filter
  if (status === 'COMPLETED') {
    pipeline.push({ $match: { isSubmitted: true } });
  } else if (status === 'PENDING') {
    pipeline.push({ $match: { isSubmitted: false } });
  }

  // Total count for pagination
  const totalResults = await MCQTest.aggregate([...pipeline, { $count: 'count' }]);
  const total = totalResults.length > 0 ? totalResults[0].count : 0;

  // Sorting and Pagination
  pipeline.push({ $sort: { createdAt: -1 } });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: parseInt(limit) });

  // Populate creator info (Aggregation doesn't support populate, so we use another lookup or map later)
  // Let's use map for simplicity after aggregate
  const tests = await MCQTest.aggregate(pipeline);
  
  // Populate creator manually
  const populatedTests = await MCQTest.populate(tests, { path: 'createdBy', select: 'name profilePic' });

  return {
    data: populatedTests,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    hasMore: skip + populatedTests.length < total
  };
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
export const reassignTest = async (testId, teacherId, studentId) => {
  const test = await MCQTest.findById(testId);
  if (!test) throw new ErrorResponse('Test not found', 404);

  if (test.createdBy.toString() !== teacherId.toString()) {
    throw new ErrorResponse('Unauthorized: Only creator can reassign this test', 403);
  }

  // Delete existing results for this student on this test
  await MCQResult.deleteMany({ testId, studentId });

  // Ensure they are in the assignedStudents list
  const currentAssigned = test.assignedStudents.map(id => id.toString());
  if (!currentAssigned.includes(studentId.toString())) {
    test.assignedStudents.push(studentId);
    await test.save();
  }

  return test;
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

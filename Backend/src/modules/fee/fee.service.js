import { FeeConfig, FeePayment } from './fee.model.js';
import User from '../auth/auth.model.js';
import ErrorResponse from '../../utils/errorResponse.js';

/**
 * @desc Get all payments for a teacher within a date range
 */
export const getPaymentsForTeacher = async (teacherId, startDate, endDate) => {
  const query = { teacherId };

  if (startDate || endDate) {
    query.paymentDate = {};
    if (startDate) query.paymentDate.$gte = new Date(startDate);
    if (endDate) query.paymentDate.$lte = new Date(endDate);
  }

  return await FeePayment.find(query)
    .populate('studentId', 'name username profilePic')
    .sort({ paymentDate: -1 });
};

/**
 * @desc Get all payments for a student
 */
export const getPaymentsForStudent = async (studentId) => {
  return await FeePayment.find({ studentId })
    .populate('teacherId', 'name username profilePic')
    .sort({ paymentDate: -1 });
};

/**
 * @desc Record a cash payment for a student
 */
export const recordPayment = async (teacherId, paymentData) => {
  const { studentId, amount, paymentDate, remarks } = paymentData;

  // Verify teacher exists and student is linked
  const teacher = await User.findById(teacherId);
  if (!teacher) throw new ErrorResponse('Teacher profile not found', 404);

  const isLinked = teacher.students && teacher.students.some(id => id.toString() === studentId.toString());
  if (!isLinked) {
    throw new ErrorResponse('This student is not assigned to you', 403);
  }

  const payment = await FeePayment.create({
    teacherId,
    studentId,
    amount,
    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    remarks: remarks || '',
    status: 'PAID'
  });

  return await payment.populate('studentId', 'name username profilePic');
};

/**
 * @desc Update a payment record
 */
export const updatePayment = async (paymentId, teacherId, updateData) => {
  const payment = await FeePayment.findById(paymentId);
  if (!payment) throw new ErrorResponse('Payment record not found', 404);

  if (payment.teacherId.toString() !== teacherId.toString()) {
    throw new ErrorResponse('Not authorized to modify this payment', 403);
  }

  if (updateData.amount !== undefined) payment.amount = updateData.amount;
  if (updateData.paymentDate !== undefined) payment.paymentDate = new Date(updateData.paymentDate);
  if (updateData.remarks !== undefined) payment.remarks = updateData.remarks;

  await payment.save();
  return await payment.populate('studentId', 'name username profilePic');
};

/**
 * @desc Delete a payment record
 */
export const deletePayment = async (paymentId, teacherId) => {
  const payment = await FeePayment.findById(paymentId);
  if (!payment) throw new ErrorResponse('Payment record not found', 404);

  if (payment.teacherId.toString() !== teacherId.toString()) {
    throw new ErrorResponse('Not authorized to delete this payment', 403);
  }

  await FeePayment.findByIdAndDelete(paymentId);
  return payment;
};

/**
 * @desc Get fee configurations for teacher or student
 */
export const getFeeConfigs = async (userId, role) => {
  if (role === 'TEACHER') {
    return await FeeConfig.find({ teacherId: userId })
      .populate('studentId', 'name username profilePic');
  } else {
    return await FeeConfig.find({ studentId: userId })
      .populate('teacherId', 'name username profilePic');
  }
};

/**
 * @desc Set student-specific fee config
 */
export const setStudentFeeConfig = async (teacherId, studentId, monthlyAmount) => {
  // Verify student is linked to teacher
  const teacher = await User.findById(teacherId);
  if (!teacher) throw new ErrorResponse('Teacher profile not found', 404);

  const isLinked = teacher.students && teacher.students.some(id => id.toString() === studentId.toString());
  if (!isLinked) {
    throw new ErrorResponse('This student is not assigned to you', 403);
  }

  const config = await FeeConfig.findOneAndUpdate(
    { teacherId, studentId },
    { $set: { monthlyAmount } },
    { new: true, upsert: true, runValidators: true }
  );

  return await config.populate('studentId', 'name username profilePic');
};

/**
 * @desc Set teacher's default fee
 */
export const setTeacherDefaultFee = async (teacherId, defaultMonthlyFee) => {
  const teacher = await User.findByIdAndUpdate(
    teacherId,
    { $set: { defaultMonthlyFee } },
    { new: true, runValidators: true }
  ).select('name email defaultMonthlyFee');

  if (!teacher) throw new ErrorResponse('Teacher profile not found', 404);
  return teacher;
};

/**
 * @desc Get overview of students, their configured rates, and payment history for a given month
 */
export const getFeeOverview = async (userId, role, monthStr) => {
  // monthStr format: "YYYY-MM" (e.g., "2026-07")
  const targetMonth = monthStr || new Date().toISOString().slice(0, 7);
  const startOfTargetMonth = new Date(`${targetMonth}-01T00:00:00.000Z`);
  const endOfTargetMonth = new Date(startOfTargetMonth.getFullYear(), startOfTargetMonth.getMonth() + 1, 0, 23, 59, 59, 999);

  if (role === 'TEACHER') {
    const teacher = await User.findById(userId)
      .populate('students', 'name username profilePic defaultMonthlyFee')
      .lean();

    if (!teacher) throw new ErrorResponse('Teacher profile not found', 404);

    const studentIds = teacher.students ? teacher.students.map(s => s._id) : [];

    // Get specific fee configs override
    const configs = await FeeConfig.find({ teacherId: userId, studentId: { $in: studentIds } }).lean();
    const configsMap = new Map(configs.map(c => [c.studentId.toString(), c.monthlyAmount]));

    // Get payments for the target month
    const payments = await FeePayment.find({
      teacherId: userId,
      studentId: { $in: studentIds },
      paymentDate: { $gte: startOfTargetMonth, $lte: endOfTargetMonth }
    }).lean();

    // Map payments by studentId
    const paymentsMap = new Map();
    payments.forEach(p => {
      if (!paymentsMap.has(p.studentId.toString())) {
        paymentsMap.set(p.studentId.toString(), []);
      }
      paymentsMap.get(p.studentId.toString()).push(p);
    });

    // Compile student list with rates and payment status
    const studentsOverview = (teacher.students || []).map(student => {
      const studentIdStr = student._id.toString();
      const customRate = configsMap.get(studentIdStr);
      const rate = customRate !== undefined ? customRate : teacher.defaultMonthlyFee;

      const studentPayments = paymentsMap.get(studentIdStr) || [];
      const totalPaidThisMonth = studentPayments.reduce((sum, p) => sum + p.amount, 0);
      const isPaid = totalPaidThisMonth >= rate && rate > 0;

      return {
        _id: student._id,
        name: student.name,
        username: student.username,
        profilePic: student.profilePic,
        configuredRate: rate,
        isCustomRate: customRate !== undefined,
        paymentsThisMonth: studentPayments,
        totalPaidThisMonth,
        status: isPaid ? 'PAID' : (totalPaidThisMonth > 0 ? 'PARTIAL' : 'UNPAID')
      };
    });

    return {
      defaultMonthlyFee: teacher.defaultMonthlyFee,
      students: studentsOverview
    };
  } else {
    // Student role
    const student = await User.findById(userId)
      .populate('teachers', 'name username profilePic defaultMonthlyFee')
      .lean();

    if (!student) throw new ErrorResponse('Student profile not found', 404);

    const teacherIds = student.teachers ? student.teachers.map(t => t._id) : [];

    // Get configs for this student
    const configs = await FeeConfig.find({ studentId: userId, teacherId: { $in: teacherIds } }).lean();
    const configsMap = new Map(configs.map(c => [c.teacherId.toString(), c.monthlyAmount]));

    // Get payments for the target month
    const payments = await FeePayment.find({
      studentId: userId,
      teacherId: { $in: teacherIds },
      paymentDate: { $gte: startOfTargetMonth, $lte: endOfTargetMonth }
    }).lean();

    const paymentsMap = new Map();
    payments.forEach(p => {
      if (!paymentsMap.has(p.teacherId.toString())) {
        paymentsMap.set(p.teacherId.toString(), []);
      }
      paymentsMap.get(p.teacherId.toString()).push(p);
    });

    const teachersOverview = (student.teachers || []).map(teacher => {
      const teacherIdStr = teacher._id.toString();
      const customRate = configsMap.get(teacherIdStr);
      const rate = customRate !== undefined ? customRate : teacher.defaultMonthlyFee;

      const teacherPayments = paymentsMap.get(teacherIdStr) || [];
      const totalPaidThisMonth = teacherPayments.reduce((sum, p) => sum + p.amount, 0);
      const isPaid = totalPaidThisMonth >= rate && rate > 0;

      return {
        _id: teacher._id,
        name: teacher.name,
        username: teacher.username,
        profilePic: teacher.profilePic,
        rate,
        paymentsThisMonth: teacherPayments,
        totalPaidThisMonth,
        status: isPaid ? 'PAID' : (totalPaidThisMonth > 0 ? 'PARTIAL' : 'UNPAID')
      };
    });

    return {
      teachers: teachersOverview
    };
  }
};

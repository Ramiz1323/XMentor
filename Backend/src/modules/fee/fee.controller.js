import asyncHandler from '../../utils/asyncHandler.js';
import * as feeService from './fee.service.js';
import ErrorResponse from '../../utils/errorResponse.js';

export const getFeeOverview = asyncHandler(async (req, res) => {
  const { month } = req.query; // format YYYY-MM
  const overview = await feeService.getFeeOverview(req.user._id, req.user.role, month);
  res.status(200).json({
    success: true,
    data: overview,
  });
});

export const getPayments = asyncHandler(async (req, res) => {
  const { startDate, endDate, studentId } = req.query;
  let payments;

  if (req.user.role === 'TEACHER') {
    // Teachers get all payments or can filter by studentId if they choose to
    if (studentId) {
      payments = await feeService.getPaymentsForStudent(studentId);
      // Filter by teacherId to ensure they only see payments they received
      payments = payments.filter(p => p.teacherId._id.toString() === req.user._id.toString() || p.teacherId.toString() === req.user._id.toString());
    } else {
      payments = await feeService.getPaymentsForTeacher(req.user._id, startDate, endDate);
    }
  } else {
    // Students only get their own payments
    payments = await feeService.getPaymentsForStudent(req.user._id);
  }

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments,
  });
});

export const recordPayment = asyncHandler(async (req, res) => {
  const { studentId, amount, paymentDate, remarks } = req.body;
  if (!studentId) throw new ErrorResponse('Student ID is required', 400);
  if (amount === undefined || amount === null) throw new ErrorResponse('Payment amount is required', 400);

  const payment = await feeService.recordPayment(req.user._id, {
    studentId,
    amount,
    paymentDate,
    remarks,
  });

  res.status(201).json({
    success: true,
    message: 'Payment recorded successfully',
    data: payment,
  });
});

export const updatePayment = asyncHandler(async (req, res) => {
  const { amount, paymentDate, remarks } = req.body;
  const payment = await feeService.updatePayment(req.params.id, req.user._id, {
    amount,
    paymentDate,
    remarks,
  });

  res.status(200).json({
    success: true,
    message: 'Payment record updated',
    data: payment,
  });
});

export const deletePayment = asyncHandler(async (req, res) => {
  await feeService.deletePayment(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: 'Payment record deleted successfully',
  });
});

export const getConfigs = asyncHandler(async (req, res) => {
  const configs = await feeService.getFeeConfigs(req.user._id, req.user.role);
  res.status(200).json({
    success: true,
    data: configs,
  });
});

export const updateConfig = asyncHandler(async (req, res) => {
  const { studentId, monthlyAmount } = req.body;
  if (!studentId) throw new ErrorResponse('Student ID is required', 400);
  if (monthlyAmount === undefined || monthlyAmount === null) throw new ErrorResponse('Monthly amount is required', 400);

  const config = await feeService.setStudentFeeConfig(req.user._id, studentId, monthlyAmount);
  res.status(200).json({
    success: true,
    message: 'Student rate configuration updated',
    data: config,
  });
});

export const updateDefaultFee = asyncHandler(async (req, res) => {
  const { defaultMonthlyFee } = req.body;
  if (defaultMonthlyFee === undefined || defaultMonthlyFee === null) {
    throw new ErrorResponse('Default monthly fee is required', 400);
  }

  const teacher = await feeService.setTeacherDefaultFee(req.user._id, defaultMonthlyFee);
  res.status(200).json({
    success: true,
    message: 'Default monthly fee updated',
    data: teacher,
  });
});

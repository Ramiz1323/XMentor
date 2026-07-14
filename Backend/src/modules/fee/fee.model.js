import mongoose from 'mongoose';

const feeConfigSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    monthlyAmount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

// Ensure a student has exactly one fee configuration per teacher
feeConfigSchema.index({ teacherId: 1, studentId: 1 }, { unique: true });

const feePaymentSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['PAID', 'UNPAID'],
      default: 'PAID',
    },
  },
  { timestamps: true }
);

// Indexes for high performance querying
feePaymentSchema.index({ teacherId: 1, paymentDate: -1 });
feePaymentSchema.index({ studentId: 1, paymentDate: -1 });

export const FeeConfig = mongoose.model('FeeConfig', feeConfigSchema);
export const FeePayment = mongoose.model('FeePayment', feePaymentSchema);

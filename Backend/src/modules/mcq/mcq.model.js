import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  q: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (v) => v.length === 4,
      message: 'Exactly 4 options are required',
    },
  },
  correct: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    trim: true,
  },
});

const mcqTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Test title is required'],
      trim: true,
    },
    subject: {
      type: String,
      enum: ['MATHS', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'CODING', 'OTHERS'],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: false,
    },
    assignedStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    hasTimer: {
      type: Boolean,
      default: true,
    },
    questions: [questionSchema],
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: 1,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const mcqResultSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MCQTest',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number, // in seconds
      required: true,
    },
    answers: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

mcqResultSchema.index({ testId: 1, studentId: 1 }, { unique: true });

mcqTestSchema.index({ communityId: 1 });
mcqTestSchema.index({ createdBy: 1 });
mcqResultSchema.index({ studentId: 1 });

const MCQTest = mongoose.model('MCQTest', mcqTestSchema);
const MCQResult = mongoose.model('MCQResult', mcqResultSchema);

export { MCQTest, MCQResult };

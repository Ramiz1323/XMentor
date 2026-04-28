import mongoose from 'mongoose';

const subjectiveTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Test title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      enum: ['MATHS', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'CODING', 'OTHERS'],
      required: true,
    },
    class: {
      type: String,
      trim: true,
    },
    board: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      default: 'English',
    },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD', 'EXPERT'],
      default: 'MEDIUM',
    },
    hasTimer: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
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
    questions: [{
      text: { type: String, required: true },
      marks: { type: Number, default: 10 }
    }],
    maxMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    }
  },
  {
    timestamps: true,
  }
);

const subjectiveResultSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubjectiveTest',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    marksObtained: {
      type: Number,
      default: 0,
    },
    maxMarks: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'GRADED'],
      default: 'PENDING',
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    gradedAt: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

subjectiveResultSchema.index({ testId: 1, studentId: 1 }, { unique: true });
subjectiveTestSchema.index({ createdBy: 1 });
subjectiveTestSchema.index({ communityId: 1 });

const SubjectiveTest = mongoose.model('SubjectiveTest', subjectiveTestSchema);
const SubjectiveResult = mongoose.model('SubjectiveResult', subjectiveResultSchema);

export { SubjectiveTest, SubjectiveResult };

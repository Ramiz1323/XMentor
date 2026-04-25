import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Please specify the subject'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'RESOLVED', 'REJECTED'],
      default: 'PENDING',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    attachments: [String],
    answer: {
      content: {
        type: String,
        trim: true,
      },
      answeredAt: Date,
      attachments: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Populate user names by default when querying
doubtSchema.pre(/^find/, function (next) {
  this.populate('student', 'name profilePic')
      .populate('teacher', 'name profilePic');
  next();
});

export default mongoose.model('Doubt', doubtSchema);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['TEACHER', 'STUDENT'],
      default: 'STUDENT',
    },
    profilePic: {
      type: String,
      default: '',
    },
    profilePicId: {
      type: String,
      default: '',
    },
    boardInfo: {
      board: {
        type: String,
        enum: ['CBSE', 'WB', 'ICSE', 'NONE'],
        default: 'NONE',
      },
      class: {
        type: String,
        default: '10',
      },
      subjects: [String],
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
    },
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    teachers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    devProfile: {
      github: {
        type: String,
        default: '',
      },
      skills: [String],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ username: 1 }, { unique: true, sparse: true });

export default mongoose.model('User', userSchema);

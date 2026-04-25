import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  alias: {
    type: String,
    trim: true,
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const messageSchema = new mongoose.Schema({
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderAlias: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Community name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    type: {
      type: String,
      enum: ['BOARD', 'DEV'],
      required: [true, 'Community type is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
    memberCount: {
      type: Number,
      default: 1, 
    },
    maxMembers: {
      type: Number,
      default: 500,
    },
    accessCode: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model('Message', messageSchema);
export default mongoose.model('Community', communitySchema);

// Indexes for performance and scalability
communitySchema.index({ members: 1 });
communitySchema.index({ type: 1 });
communitySchema.index({ createdBy: 1 });

// Message Indexes: Quick retrieval and auto-pruning
messageSchema.index({ community: 1, createdAt: 1 });
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // Auto-delete after 30 days

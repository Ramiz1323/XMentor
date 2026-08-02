import mongoose from 'mongoose';

const pdfResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'PDF title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    subject: {
      type: String,
      enum: [
        'MATHS', 'SCIENCE', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY',
        'HISTORY', 'GEOGRAPHY', 'ENGLISH', 'BENGALI', 'HINDI',
        'EVS', 'SOCIAL_SCIENCE', 'COMPUTER', 'CODING', 'OTHERS'
      ],
      required: [true, 'Subject is required'],
    },
    pdfUrl: {
      type: String,
      required: [true, 'PDF URL is required'],
    },
    pdfFileId: {
      type: String,
      required: [true, 'PDF file ID is required'],
    },
    originalName: {
      type: String,
      default: '',
    },
    fileSizeBytes: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

pdfResourceSchema.index({ createdBy: 1 });
pdfResourceSchema.index({ assignedStudents: 1 });

const PdfResource = mongoose.model('PdfResource', pdfResourceSchema);

export default PdfResource;

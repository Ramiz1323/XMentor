import Doubt from './doubt.model.js';
import User from '../auth/auth.model.js';
import imagekit from '../../config/imagekit.js';
import ErrorResponse from '../../utils/errorResponse.js';

export const handleDoubtImage = async (fileBuffer, fileName) => {
  const uploadResponse = await imagekit.files.upload({
    file: fileBuffer.toString('base64'),
    fileName: `doubt_${Date.now()}_${fileName}`,
    folder: '/xmentor/doubts',
  });
  return uploadResponse.url;
};

/**
 * @desc Ask a new doubt
 */
export const createDoubt = async (userId, doubtData) => {
  const { teacherId, title, description, subject, priority } = doubtData;

  // Verify the student exists and the teacher is assigned
  const student = await User.findById(userId);
  if (!student) throw new ErrorResponse('User not found', 404);

  const isAssigned = student.teachers.some(t => t.toString() === teacherId.toString());
  if (!isAssigned) {
    throw new ErrorResponse('You can only ask doubts to your assigned teachers', 403);
  }

  const doubt = await Doubt.create({
    student: userId,
    teacher: teacherId,
    title,
    description,
    subject,
    priority: priority || 'MEDIUM',
    attachments: doubtData.attachments || []
  });

  return await doubt.populate(['student', 'teacher']);
};

/**
 * @desc Get doubts based on user role
 */
export const getDoubts = async (userId, role, filters = {}) => {
  const query = role === 'TEACHER' ? { teacher: userId } : { student: userId };
  
  if (filters.status) query.status = filters.status;
  if (filters.subject) query.subject = filters.subject;

  return await Doubt.find(query).sort({ createdAt: -1 });
};

/**
 * @desc Get a single doubt by ID
 */
export const getDoubtById = async (doubtId, userId) => {
  const doubt = await Doubt.findById(doubtId);
  if (!doubt) throw new ErrorResponse('Doubt not found', 404);

  // Authorization: Must be the student or the teacher
  if (doubt.student._id.toString() !== userId.toString() && 
      doubt.teacher._id.toString() !== userId.toString()) {
    throw new ErrorResponse('Not authorized to view this doubt', 403);
  }

  return doubt;
};

/**
 * @desc Resolve (answer) a doubt
 */
export const resolveDoubt = async (doubtId, teacherId, answerContent) => {
  const doubt = await Doubt.findById(doubtId);
  if (!doubt) throw new ErrorResponse('Doubt not found', 404);

  // Authorization
  if (doubt.teacher._id.toString() !== teacherId.toString()) {
    throw new ErrorResponse('Only the assigned teacher can resolve this doubt', 403);
  }

  doubt.status = 'RESOLVED';
  doubt.answer = {
    content: answerContent,
    answeredAt: new Date()
  };

  await doubt.save();
  return await doubt.populate(['student', 'teacher']);
};

/**
 * @desc Delete a doubt (only by student while pending)
 */
export const deleteDoubt = async (doubtId, userId) => {
  const doubt = await Doubt.findById(doubtId);
  if (!doubt) throw new ErrorResponse('Doubt not found', 404);

  if (doubt.student._id.toString() !== userId.toString()) {
    throw new ErrorResponse('Not authorized to delete this doubt', 403);
  }

  if (doubt.status !== 'PENDING') {
    throw new ErrorResponse('Cannot delete a resolved doubt', 400);
  }

  return await Doubt.findByIdAndDelete(doubtId);
};

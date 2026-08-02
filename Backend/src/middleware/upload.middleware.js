import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpeg, jpg, png, webp) are allowed!'));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: imageFileFilter,
});

const pdfFileFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === 'application/pdf' ||
    path.extname(file.originalname).toLowerCase() === '.pdf';

  if (isPdf) {
    return cb(null, true);
  }
  cb(new Error('Only PDF files are allowed!'));
};

export const uploadPdfMiddleware = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB limit
  },
  fileFilter: pdfFileFilter,
});

export default upload;

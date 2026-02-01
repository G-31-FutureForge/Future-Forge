import express from 'express';
import multer from 'multer';
import path from 'path';
import { handleCareerGuidance, checkCareerGuidanceHealth } from '../controllers/careerGuidanceController.js';

const router = express.Router();

// Configure multer for resume uploads (for Graduate level)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'career-resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow PDF and DOCX files
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/msword') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, and DOC files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

// Health check endpoint
router.get('/health', checkCareerGuidanceHealth);

// Main career guidance endpoint
router.post('/generate', upload.single('resume'), handleCareerGuidance);

export default router;


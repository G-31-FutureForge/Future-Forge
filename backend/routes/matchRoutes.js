import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { handleMatch, matchResumeWithJobs } from '../controllers/matchController.js';
import loadingScreen from '../middleware/loadingScreen.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = 'uploads/resumes';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads/resumes directory');
}

const upload = multer({ 
  dest: uploadsDir,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

router.post(
  '/',
  loadingScreen,
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'job', maxCount: 1 }
  ]),
  handleMatch
);

/**
 * POST /api/match/resume-jobs
 * Match resume skills with multiple private sector jobs
 * Body: FormData with 'resume' file and 'jobs' JSON string
 */
router.post('/resume-jobs', upload.single('resume'), matchResumeWithJobs);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds 5MB limit'
      });
    }
    return res.status(400).json({
      success: false,
      error: error.message
    });
  } else if (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  next();
});

export default router;
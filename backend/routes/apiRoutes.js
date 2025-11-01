import express from 'express';
import multer from 'multer';
import { handleMatch } from '../controllers/matchController.js';
import { generateReport } from '../controllers/reportController.js';
import loadingScreen from '../middleware/loadingScreen.js';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  }
});

// Middleware to parse form data
router.use(express.urlencoded({ extended: true }));

// API Routes
router.post('/skill-analysis', 
  loadingScreen,
  upload.single('resume'),
  (req, res, next) => {
    console.log('File:', req.file);
    console.log('Job Description:', req.body.jobDescription);
    next();
  },
  handleMatch
);

router.post('/match', 
  loadingScreen,
  upload.fields([{ name: 'resume' }, { name: 'job' }]),
  handleMatch
);

router.post('/report', generateReport);

export default router;
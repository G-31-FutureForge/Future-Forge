import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Candidate from '../models/Candidate.js';

const router = express.Router();

// ES module dirname resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads/resumes directory exists
const resumesDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
  console.log('✅ Ensured uploads/resumes directory exists for candidate uploads');
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resumesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  },
});

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
    }
  },
});

// POST /api/apply - public job application endpoint
router.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const { fullName, email, phone, jobId, jobTitle, company } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and phone are required.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required.',
      });
    }

    const relativePath = path
      .join('uploads', 'resumes', req.file.filename)
      .replace(/\\/g, '/');

    const candidate = new Candidate({
      fullName,
      email,
      phone,
      jobId,
      jobTitle,
      company,
      resumePath: `/${relativePath}`,
    });

    await candidate.save();

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: candidate,
    });
  } catch (error) {
    console.error('Error in POST /api/apply:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit application.',
    });
  }
});

// GET /api/candidates - list all candidates (simple recruiter dashboard API)
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ appliedAt: -1 });
    return res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    console.error('Error in GET /api/candidates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch candidates.',
    });
  }
});

export default router;


import express from 'express';
const router = express.Router();
import { 
  getAllJobs, 
  getJob, 
  createJob, 
  updateJob, 
  deleteJob, 
  searchJobs,
  getMyJobs,
  toggleJobStatus,
  getJobStats,
  getRecruiterPostedJobs
} from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

// Public routes
router.get('/search', searchJobs);
router.get('/stats', getJobStats);
router.get('/recruiter-posted', getRecruiterPostedJobs); // For candidate portal - must be before /:id
router.get('/', getAllJobs);
router.get('/:id', getJob);

// Protected routes (require authentication)
// Job posting by recruiter
router.post('/', protect, createJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);
router.patch('/:id/status', protect, toggleJobStatus);

// Recruiter's own jobs
router.get('/recruiter/my-jobs', protect, getMyJobs);

export default router;
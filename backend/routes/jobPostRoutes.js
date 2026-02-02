// backend/routes/jobPostRoutes.js
import express from 'express';
import {
    createJobPost,
    getAllJobPosts,
    getJobPost,
    getMyJobPosts,
    updateJobPost,
    deleteJobPost,
    searchJobPosts,
    applyForJob,
    getJobApplications,
    updateApplicationStatus,
    closeJobPost,
    publishJobPost,
    getJobPostStats
} from '../controllers/jobPostController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllJobPosts);
router.get('/search/advanced', searchJobPosts);
router.get('/:id', getJobPost);

// Protected routes (require authentication)
router.post('/', protect, authorize('recruiter', 'admin'), createJobPost);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJobPost);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJobPost);

// Recruiter specific routes
router.get('/recruiter/my-jobs', protect, authorize('recruiter', 'admin'), getMyJobPosts);
router.put('/:id/publish', protect, authorize('recruiter', 'admin'), publishJobPost);
router.put('/:id/close', protect, authorize('recruiter', 'admin'), closeJobPost);
router.get('/:id/statistics', protect, authorize('recruiter', 'admin'), getJobPostStats);

// Application routes
router.post('/:id/apply', protect, authorize('student'), applyForJob);
router.get('/:id/applications', protect, authorize('recruiter', 'admin'), getJobApplications);
router.put('/:id/applications/:appId', protect, authorize('recruiter', 'admin'), updateApplicationStatus);

export default router;

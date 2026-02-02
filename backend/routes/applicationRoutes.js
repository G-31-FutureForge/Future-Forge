import express from 'express';
const router = express.Router();
import {
  applyForJob,
  getJobApplications,
  getMyApplications,
  getApplication,
  updateApplicationStatus,
  withdrawApplication,
  scheduleInterview,
  getRecruiterStats,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';

// Applicant routes
router.post('/:jobId/apply', protect, applyForJob);
router.get('/applicant/my-applications', protect, getMyApplications);
router.delete('/:applicationId/withdraw', protect, withdrawApplication);

// Recruiter routes
router.get('/job/:jobId/applications', protect, getJobApplications);
router.get('/:applicationId', protect, getApplication);
router.patch('/:applicationId/status', protect, updateApplicationStatus);
router.post('/:applicationId/schedule-interview', protect, scheduleInterview);
router.get('/recruiter/stats', protect, getRecruiterStats);

export default router;

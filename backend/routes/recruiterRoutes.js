// backend/routes/recruiterRoutes.js
import express from 'express';
import { createJob, getMyJobs, getAllCandidates, searchCandidates } from '../controllers/recruiterController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('recruiter'));

// Jobs
router.post('/jobs', createJob);
router.get('/jobs', getMyJobs);

// Candidates - search must be before :id to avoid "search" being treated as id
router.get('/candidates/search', searchCandidates);
router.get('/candidates', getAllCandidates);

export default router;

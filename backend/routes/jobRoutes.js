import express from 'express';
const router = express.Router();
import { getAllJobs, getJob, createJob, updateJob, deleteJob, searchJobs } from '../controllers/jobController.js';

// GET all jobs
router.get('/', getAllJobs);

// GET search jobs
router.get('/search', searchJobs);

// GET single job
router.get('/:id', getJob);

// POST create new job
router.post('/', createJob);

// PUT update job
router.put('/:id', updateJob);

// DELETE job
router.delete('/:id', deleteJob);

export default router;
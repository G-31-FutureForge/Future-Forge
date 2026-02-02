import express from 'express';
import { exploreJobs, getFeaturedJobs, getJobsByLocation } from '../controllers/jobExplorationController.js';

const router = express.Router();

/**
 * GET /api/jobs/explore
 * Search and explore jobs from Jooble API
 * Query params:
 * - keywords: Job search keywords
 * - location: Job location
 * - page: Page number (default: 1)
 * - radius: Search radius in km (default: 25)
 * - salary: Salary range
 * - type: Job type
 * - workType: Work type
 * - qualification: Education qualification (10th, 12th, graduate, all)
 */
router.get('/explore', exploreJobs);

/**
 * GET /api/jobs/featured
 * Get featured/popular jobs
 * Query params:
 * - location: Job location
 */
router.get('/featured', getFeaturedJobs);

/**
 * GET /api/jobs/location/:location
 * Get jobs by specific location
 * Query params:
 * - keywords: Job search keywords
 * - page: Page number
 */
router.get('/location/:location', getJobsByLocation);

export default router;


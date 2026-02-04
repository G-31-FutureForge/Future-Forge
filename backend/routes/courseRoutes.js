import express from 'express';
import { getCourses, getCoursesByEducation, getEducationLevels, getAllCoursesByEducation } from '../controllers/courseController.js';

const router = express.Router();

// Legacy - GET /api/courses?query=python&provider=all|coursera|youtube&limit=5
router.get('/', getCourses);

// NEW - Get courses by education level
// GET /api/courses-by-education/10th
// GET /api/courses-by-education/12th
// GET /api/courses-by-education/graduation
router.get('/by-education/:educationLevel', getCoursesByEducation);

// NEW - Get all available education levels
// GET /api/education-levels
router.get('/levels/all', getEducationLevels);

// NEW - Get all courses grouped by education level
// GET /api/all-courses-by-education
router.get('/all/by-education', getAllCoursesByEducation);

export default router;

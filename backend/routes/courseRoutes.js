import express from 'express';
import { getCourses } from '../controllers/courseController.js';

const router = express.Router();

// GET /api/courses?query=python&provider=all|coursera|youtube&limit=5
router.get('/', getCourses);

export default router;

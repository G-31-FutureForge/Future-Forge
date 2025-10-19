const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// GET all jobs
router.get('/', jobController.getAllJobs);

// GET search jobs
router.get('/search', jobController.searchJobs);

// GET single job
router.get('/:id', jobController.getJob);

// POST create new job
router.post('/', jobController.createJob);

// PUT update job
router.put('/:id', jobController.updateJob);

// DELETE job
router.delete('/:id', jobController.deleteJob);

module.exports = router;
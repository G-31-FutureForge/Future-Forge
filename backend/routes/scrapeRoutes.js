import express from 'express';
import { scrapeSarkariResultJobs } from '../scrapers/sarkariResultScraperV2.js';
const router = express.Router();

// Optional: simple in-memory cache
let cachedJobs = null;
let lastFetchTime = 0;
const cacheDuration = 5 * 60 * 1000; // 5 minutes

// GET /api/scrape/sarkari-result
router.get('/sarkari-result', async (req, res) => {
  try {
    console.log('Received request for Sarkari Result jobs');
    const qualification = (req.query.qualification || '').trim().toLowerCase();
    console.log('Qualification filter:', qualification);

    const validQualifications = ['10th', '12th', 'graduate', 'all'];
    if (qualification && !validQualifications.includes(qualification)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid qualification filter'
      });
    }

    const now = Date.now();
    if (cachedJobs && now - lastFetchTime < cacheDuration) {
      console.log('Serving from cache');
      const filtered = qualification
        ? cachedJobs.jobs.filter(j => j.qualification === qualification || j.qualification === 'all')
        : cachedJobs.jobs;

      return res.json({
        success: true,
        source: cachedJobs.source,
        count: filtered.length,
        jobs: filtered,
        error: cachedJobs.error || null
      });
    }

    const result = await scrapeSarkariResultJobs();
    console.log('Scraper result source:', result.source);
    if (result.error) console.log('Scraper error:', result.error);

    let returnedJobs = Array.isArray(result.jobs) ? result.jobs : [];
    if (qualification) {
      returnedJobs = returnedJobs.filter(j => j.qualification === qualification || j.qualification === 'all');
    }

    const responsePayload = {
      success: true,
      source: result.source,
      count: returnedJobs.length,
      jobs: returnedJobs,
      error: result.error || null
    };

    cachedJobs = result;
    lastFetchTime = now;

    res.json(responsePayload);
  } catch (error) {
    console.error('Error in /sarkari-result route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs',
      message: error.message
    });
  }
});

export default router;
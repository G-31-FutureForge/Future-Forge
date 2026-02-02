import { fetchJoobleJobs, transformJoobleJobs } from '../services/joobleService.js';

/**
 * Search and fetch jobs from Jooble API for job exploration
 * GET /api/jobs/explore
 */
export const exploreJobs = async (req, res) => {
  try {
    const {
      keywords = '',
      location = '',
      page = 1,
      radius = 25,
      salary = '',
      type = '',
      workType = '',
      qualification = 'all',
    } = req.query;

    // Map qualification to appropriate keywords
    const qualificationKeywords = getQualificationKeywords(qualification);
    const searchKeywords = keywords 
      ? `${keywords} ${qualificationKeywords}`.trim()
      : qualificationKeywords;

    console.log('Fetching jobs from Jooble with params:', {
      keywords: searchKeywords,
      location,
      page,
      qualification,
    });

    const searchParams = {
      keywords: searchKeywords,
      location,
      page: parseInt(page),
      radius: parseInt(radius),
      salary,
      type,
      workType,
    };

    const result = await fetchJoobleJobs(searchParams);

    if (!result.success) {
      // If Jooble is down or times out, degrade gracefully instead of 500
      console.error('Jooble API error, falling back to empty job list:', result.error);

      return res.status(200).json({
        success: true,
        jobs: [],
        totalCount: 0,
        totalPages: 1,
        currentPage: parseInt(page),
        source: 'jooble-fallback',
        message: 'Jooble API is currently unavailable. Showing no live private jobs.',
      });
    }

    // Transform Jooble jobs to our format
    const transformedJobs = transformJoobleJobs(result.jobs || []);

    // Filter jobs by qualification if needed
    let filteredJobs = transformedJobs;
    if (qualification !== 'all') {
      filteredJobs = transformedJobs.filter(
        job => job.requiredQualification === qualification || 
               job.requiredQualification === 'all'
      );
    }

    res.json({
      success: true,
      jobs: filteredJobs,
      totalCount: filteredJobs.length,
      totalPages: result.totalPages,
      currentPage: parseInt(page),
      source: 'jooble',
      hasMore: parseInt(page) < result.totalPages,
    });

  } catch (error) {
    console.error('Error in exploreJobs controller:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      jobs: [],
      message: 'Internal server error while fetching jobs',
    });
  }
};

/**
 * Get featured/popular jobs
 * GET /api/jobs/featured
 */
export const getFeaturedJobs = async (req, res) => {
  try {
    const popularKeywords = [
      'software engineer',
      'data analyst',
      'marketing specialist',
      'project manager',
      'sales representative',
    ];

    const { location = 'India' } = req.query;
    const featuredJobs = [];

    // Fetch a few jobs for each popular keyword
    for (const keyword of popularKeywords.slice(0, 3)) {
      const result = await fetchJoobleJobs({
        keywords: keyword,
        location,
        page: 1,
        radius: 25,
      });

      if (result.success && result.jobs.length > 0) {
        const transformed = transformJoobleJobs(result.jobs.slice(0, 5));
        featuredJobs.push(...transformed);
      }
    }

    // Limit to top 20 featured jobs
    const limitedJobs = featuredJobs.slice(0, 20);

    res.json({
      success: true,
      jobs: limitedJobs,
      totalCount: limitedJobs.length,
      source: 'jooble',
    });

  } catch (error) {
    console.error('Error in getFeaturedJobs controller:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      jobs: [],
      message: 'Failed to fetch featured jobs',
    });
  }
};

/**
 * Get jobs by location
 * GET /api/jobs/location/:location
 */
export const getJobsByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const { keywords = '', page = 1 } = req.query;

    const result = await fetchJoobleJobs({
      keywords,
      location,
      page: parseInt(page),
      radius: 50,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
        jobs: [],
      });
    }

    const transformedJobs = transformJoobleJobs(result.jobs);

    res.json({
      success: true,
      jobs: transformedJobs,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: parseInt(page),
      location,
    });

  } catch (error) {
    console.error('Error in getJobsByLocation controller:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      jobs: [],
    });
  }
};

/**
 * Helper function to get qualification keywords
 * @param {string} qualification - Qualification level
 * @returns {string} - Keywords for searching
 */
const getQualificationKeywords = (qualification) => {
  const keywordsMap = {
    '10th': 'matric SSC 10th',
    '12th': 'intermediate HSC 12th',
    'graduate': 'bachelor degree graduate B.A. B.Sc',
    'all': '',
  };

  return keywordsMap[qualification] || '';
};


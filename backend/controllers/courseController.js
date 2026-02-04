import fetchCourses from '../services/courseFetcher.js';
import { getCoursesByEducationLevel, getAvailableEducationLevels } from '../services/courseService.js';

// Legacy function - search courses by query
export const getCourses = async (req, res) => {
  const { query, provider = 'all', limit = 5 } = req.query;

  if (!query || query.trim() === '') {
    return res.status(400).json({ message: 'Missing required query parameter `query`. Example: /api/courses?query=python' });
  }

  try {
    console.log(`[Course Controller] Fetching courses - query: "${query}", provider: "${provider}", limit: ${limit}`);
    const courses = await fetchCourses(query, provider, Number(limit || 5));
    console.log(`[Course Controller] Fetched ${courses.length} courses for query: "${query}", provider: "${provider}"`);
    
    if (courses.length === 0) {
      console.warn(`[Course Controller] No courses found for query: "${query}", provider: "${provider}"`);
    }
    
    return res.status(200).json({ query, provider, count: courses.length, courses });
  } catch (err) {
    console.error('[Course Controller] Error:', err.message);
    console.error('[Course Controller] Stack:', err.stack);
    return res.status(500).json({ message: 'Error fetching courses', error: err.message });
  }
};

/**
 * Get career-guidance structured courses by education level
 * GET /api/courses-by-education/:educationLevel
 */
export const getCoursesByEducation = async (req, res) => {
  try {
    const { educationLevel } = req.params;

    if (!educationLevel) {
      return res.status(400).json({
        success: false,
        message: 'Education level is required'
      });
    }

    const coursesData = await getCoursesByEducationLevel(educationLevel);

    // The service returns a structured object with `totalCourses` and `coursesByType`.
    // Treat zero totalCourses as not found.
    if (!coursesData || (typeof coursesData.totalCourses === 'number' && coursesData.totalCourses === 0)) {
      return res.status(404).json({
        success: false,
        message: `No courses found for education level: ${educationLevel}`
      });
    }

    res.status(200).json({
      success: true,
      data: coursesData
    });
  } catch (error) {
    console.error('[Course API] Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch courses'
    });
  }
};

/**
 * Get all available education levels
 * GET /api/education-levels
 */
export const getEducationLevels = async (req, res) => {
  try {
    const levels = await getAvailableEducationLevels();

    res.status(200).json({
      success: true,
      data: levels
    });
  } catch (error) {
    console.error('[Course API] Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch education levels'
    });
  }
};

/**
 * Get all courses data (all education levels combined)
 * GET /api/all-courses-by-education
 */
export const getAllCoursesByEducation = async (req, res) => {
  try {
    const levels = await getAvailableEducationLevels();
    const allCourses = {};

    for (const level of levels) {
      const courseData = await getCoursesByEducationLevel(level);
      allCourses[level] = courseData;
    }

    res.status(200).json({
      success: true,
      data: allCourses
    });
  } catch (error) {
    console.error('[Course API] Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch all courses'
    });
  }
};

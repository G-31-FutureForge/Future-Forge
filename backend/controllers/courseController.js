import fetchCourses from '../services/courseFetcher.js';

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

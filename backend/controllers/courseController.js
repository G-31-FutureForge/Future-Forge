import fetchCourses from '../services/courseFetcher.js';

export const getCourses = async (req, res) => {
  const { query, provider = 'all', limit = 5 } = req.query;

  if (!query || query.trim() === '') {
    return res.status(400).json({ message: 'Missing required query parameter `query`. Example: /api/courses?query=python' });
  }

  try {
    const courses = await fetchCourses(query, provider, Number(limit || 5));
    return res.status(200).json({ query, provider, count: courses.length, courses });
  } catch (err) {
    console.error('getCourses error:', err.message);
    return res.status(500).json({ message: 'Error fetching courses', error: err.message });
  }
};

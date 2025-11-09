/**
 * Course API utility for fetching courses from backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Available course providers/platforms
 */
export const COURSE_PROVIDERS = {
  ALL: 'all',
  YOUTUBE: 'youtube',
  // Udemy and edX removed from supported providers
  KHAN_ACADEMY: 'khanacademy',
  FREECODECAMP: 'freecodecamp',
  CODECADEMY: 'codecademy',
  PLURALSIGHT: 'pluralsight',
  SKILLSHARE: 'skillshare',
  LINKEDIN: 'linkedin',
  FUTURELEARN: 'futurelearn',
  SCRAPED: 'scraped', // All scraped platforms
  COURSERA: 'coursera'
};

/**
 * Provider display names and icons
 */
export const PROVIDER_INFO = {
  [COURSE_PROVIDERS.ALL]: { name: 'All Platforms', icon: '🌐', color: '#6366f1' },
  [COURSE_PROVIDERS.YOUTUBE]: { name: 'YouTube', icon: '📺', color: '#FF0000' },
  // Udemy and edX display info removed
  [COURSE_PROVIDERS.KHAN_ACADEMY]: { name: 'Khan Academy', icon: '📚', color: '#14BF96' },
  [COURSE_PROVIDERS.FREECODECAMP]: { name: 'FreeCodeCamp', icon: '💻', color: '#0A0A23' },
  [COURSE_PROVIDERS.CODECADEMY]: { name: 'Codecademy', icon: '💻', color: '#1F4788' },
  [COURSE_PROVIDERS.PLURALSIGHT]: { name: 'Pluralsight', icon: '🎯', color: '#F15B2A' },
  [COURSE_PROVIDERS.SKILLSHARE]: { name: 'Skillshare', icon: '🎨', color: '#00FF88' },
  [COURSE_PROVIDERS.LINKEDIN]: { name: 'LinkedIn Learning', icon: '💼', color: '#0077B5' },
  [COURSE_PROVIDERS.FUTURELEARN]: { name: 'FutureLearn', icon: '🔬', color: '#DE00A5' },
  [COURSE_PROVIDERS.SCRAPED]: { name: 'All Scraped', icon: '🔍', color: '#8B5CF6' },
  [COURSE_PROVIDERS.COURSERA]: { name: 'Coursera', icon: '🎓', color: '#0056D2' }
};

/**
 * Fetch courses from backend API
 * @param {string} query - Search query
 * @param {string} provider - Provider name (default: 'all')
 * @param {number} limit - Number of courses to fetch (default: 10)
 * @returns {Promise<Array>} Array of courses
 */
export async function fetchCourses(query, provider = COURSE_PROVIDERS.ALL, limit = 10) {
  try {
    const url = `${API_BASE_URL}/courses?query=${encodeURIComponent(query)}&provider=${provider}&limit=${limit}`;
    console.log(`[CourseAPI] Fetching from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error(`[CourseAPI] Request failed: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log(`[CourseAPI] Received ${data.count || 0} courses from backend`);
    
    if (!data.courses || data.courses.length === 0) {
      console.warn(`[CourseAPI] No courses returned for query: "${query}", provider: "${provider}"`);
    }
    
    return data.courses || [];
  } catch (error) {
    console.error('[CourseAPI] Fetch error:', error);
    // Don't throw - return empty array so UI can handle it gracefully
    console.error('[CourseAPI] Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    throw error; // Re-throw so calling code can handle it
  }
}

/**
 * Normalize course data from different providers to a consistent format
 * @param {Object} course - Raw course data from API
 * @param {number} index - Index for generating unique ID
 * @returns {Object} Normalized course object
 */
export function normalizeCourse(course, index = 0) {
  // Determine if course is free
  const isFree = course.price === 'Free' || 
                 course.price === null || 
                 course.price === undefined ||
                 course.type === 'free' ||
                 (typeof course.price === 'string' && course.price.toLowerCase().includes('free'));

  // Format students/enrollment
  let studentsFormatted = course.studentsEnrolled || null;
  if (!studentsFormatted && course.viewCount) {
    const viewCount = typeof course.viewCount === 'number' 
      ? course.viewCount 
      : parseInt(course.viewCount);
    if (viewCount) {
      studentsFormatted = viewCount >= 1000 
        ? `${(viewCount / 1000).toFixed(1)}K views`
        : `${viewCount} views`;
    }
  }

  // Format rating
  let rating = course.rating || course.avgRating || null;
  if (rating !== null) {
    rating = typeof rating === 'number' ? rating : parseFloat(rating);
  }

  // Determine platform
  const platform = course.platform || course.channelTitle || 'Unknown';

  // Check if it's a YouTube video
  const link = course.link || course.url || course.videoUrl || '#';
  const isYouTube = platform.toLowerCase().includes('youtube') ||
                    link.includes('youtube.com') ||
                    link.includes('youtu.be');

  return {
    id: course.id || `course-${index}`,
    title: course.title || course.name || 'Untitled Course',
    platform: platform,
    type: isFree ? 'free' : 'paid',
    level: course.difficulty || course.level || 'Intermediate',
    duration: course.duration || 'N/A',
    rating: rating,
    students: studentsFormatted,
    link: link,
    description: course.description || '',
    thumbnail: course.thumbnail || course.photo || null,
    instructor: course.instructor || course.channelTitle || null,
    price: course.price || (isFree ? 'Free' : 'Paid'),
    isYouTube: isYouTube,
    source: course.source || 'api'
  };
}

/**
 * Fetch and normalize courses
 * @param {string} query - Search query
 * @param {string} provider - Provider name
 * @param {number} limit - Number of courses
 * @returns {Promise<Array>} Array of normalized courses
 */
export async function fetchAndNormalizeCourses(query, provider = COURSE_PROVIDERS.ALL, limit = 10) {
  try {
    console.log(`[CourseAPI] fetchAndNormalizeCourses - query: "${query}", provider: "${provider}", limit: ${limit}`);
    const courses = await fetchCourses(query, provider, limit);
    console.log(`[CourseAPI] Normalizing ${courses.length} courses`);
    const normalized = courses.map((course, index) => normalizeCourse(course, index));
    console.log(`[CourseAPI] Returning ${normalized.length} normalized courses`);
    return normalized;
  } catch (error) {
    console.error('[CourseAPI] Error in fetchAndNormalizeCourses:', error);
    // Return empty array but log the error so we can debug
    return [];
  }
}

/**
 * Get provider display name
 * @param {string} provider - Provider key
 * @returns {string} Display name
 */
export function getProviderName(provider) {
  return PROVIDER_INFO[provider]?.name || provider;
}

/**
 * Get provider icon
 * @param {string} provider - Provider key
 * @returns {string} Icon
 */
export function getProviderIcon(provider) {
  return PROVIDER_INFO[provider]?.icon || '📚';
}

/**
 * Get provider color
 * @param {string} provider - Provider key
 * @returns {string} Color
 */
export function getProviderColor(provider) {
  return PROVIDER_INFO[provider]?.color || '#6366f1';
}

export default {
  fetchCourses,
  fetchAndNormalizeCourses,
  normalizeCourse,
  COURSE_PROVIDERS,
  PROVIDER_INFO,
  getProviderName,
  getProviderIcon,
  getProviderColor
};


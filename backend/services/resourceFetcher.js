import fetchCourses from './courseFetcher.js';

/**
 * Fetch course recommendations from YouTube API based on missing skills
 * @param {string[]} skills - Array of skills to search courses for
 * @returns {Promise<Array>} Array of course recommendations
 */
const fetchResources = async (skills) => {
  if (!skills || skills.length === 0) {
    return [];
  }

  try {
    // Fetch YouTube courses for each skill
    // Limit to 3 courses per skill to avoid too many results
    const coursesPerSkill = 3;
    const allCourses = [];

    // Process skills in parallel but limit concurrent requests
    for (const skill of skills.slice(0, 10)) { // Limit to first 10 skills to avoid too many API calls
      try {
        // Fetch courses from YouTube API for this skill
        const skillCourses = await fetchCourses(skill, 'youtube', coursesPerSkill);
        
        // Map YouTube courses to match expected format
        const mappedCourses = skillCourses.map((course) => {
          // Calculate a rating based on view count and likes (if available)
          let rating = 4.5; // Default rating
          if (course.viewCount && course.likeCount) {
            // Simple heuristic: higher like-to-view ratio = better rating
            const likeRatio = course.likeCount / course.viewCount;
            rating = Math.min(5, Math.max(4, 4 + (likeRatio * 10))).toFixed(1);
            rating = parseFloat(rating);
          }

          return {
            title: course.title || 'Untitled Course',
            platform: course.platform || 'YouTube',
            type: 'free', // YouTube courses are always free
            duration: course.duration || 'Video Course',
            rating: rating,
            studentsEnrolled: course.viewCount ? `${(course.viewCount / 1000).toFixed(1)}K views` : null,
            priceRange: 'Free',
            features: ['Video tutorials', 'Community support', 'Real-time updates'],
            updatedDate: course.publishedAt ? new Date(course.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            difficulty: 'Intermediate', // Default difficulty
            link: course.link || course.videoUrl || '#',
            description: course.description || '',
            channelTitle: course.channelTitle || 'Unknown Channel',
            thumbnail: course.thumbnail || null
          };
        });

        allCourses.push(...mappedCourses);
      } catch (error) {
        console.error(`Error fetching courses for skill "${skill}":`, error.message);
        // Continue with next skill even if one fails
      }
    }

    // Deduplicate courses by link
    const seen = new Set();
    const uniqueCourses = allCourses.filter((course) => {
      const key = (course.link || course.title || '').toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    // Limit total results to reasonable number (e.g., 15 courses max)
    return uniqueCourses.slice(0, 15);
  } catch (error) {
    console.error('Error in fetchResources:', error.message);
    // Return empty array on error instead of throwing
    return [];
  }
};

export default fetchResources;
import axios from 'axios';
import { scrapeElearningPlatforms } from '../scrapers/elearningScraper.js';

const COURSERA_BASE = process.env.COURSERA_API_BASE || 'https://api.coursera.org/api/courses.v1';
const YOUTUBE_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Fetch courses from Coursera public API (best-effort mapping).
 * Note: Coursera's public endpoints vary by partner access; this is a best-effort implementation.
 */
export async function fetchCoursera(query, limit = 5) {
  try {
    const params = { q: 'search', query, limit };
    const res = await axios.get(COURSERA_BASE, { params, timeout: 8000 });
    const elements = res.data && (res.data.elements || res.data) ? (res.data.elements || res.data) : [];

    const courses = (Array.isArray(elements) ? elements.slice(0, limit) : []).map((c) => ({
      title: c.name || c.fullName || c.shortDescription || c.slug || 'Coursera Course',
      platform: 'Coursera',
      description: c.description || c.shortDescription || '',
      link: c.homeLink || (c.slug ? `https://www.coursera.org/learn/${c.slug}` : 'https://www.coursera.org'),
      rating: c.avgRating || null,
      studentsEnrolled: c.numStudents || null,
      difficulty: c.difficultyLevel || null,
      photo: (c.photo && c.photo.variants && c.photo.variants[0] && c.photo.variants[0].url) || c.photoUrl || null
    }));

    return courses;
  } catch (err) {
    console.error('fetchCoursera error:', err.message);
    return [];
  }
}

/**
 * Fetch videos from YouTube and map them as course-like resources.
 * Enhanced to fetch video details including duration and prioritize educational content.
 */
export async function fetchYouTube(query, limit = 5) {
  if (!YOUTUBE_KEY) {
    console.warn('[fetchYouTube] YOUTUBE_API_KEY not set; YouTube fetch will return empty results.');
    return [];
  }

  console.log(`[fetchYouTube] Fetching YouTube courses for query: "${query}", limit: ${limit}`);
  try {
    // Enhanced search query to prioritize educational/tutorial content
    const searchQueries = [
      `${query} full course`,
      `${query} tutorial course`,
      `${query} complete tutorial`
    ];
    
    const allVideos = [];
    const videoIds = new Set();
    
    // Search with different query variations to get better results
    for (const q of searchQueries.slice(0, 2)) { // Use first 2 query variations
      try {
        const searchRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            key: YOUTUBE_KEY,
            part: 'snippet',
            q,
            maxResults: Math.ceil(limit / 2), // Split limit across queries
            type: 'video',
            videoDuration: 'long', // Prioritize longer videos (more likely to be courses)
            order: 'relevance' // Order by relevance for educational content
          },
          timeout: 10000
        });

        const items = searchRes.data.items || [];
        for (const item of items) {
          if (!videoIds.has(item.id.videoId)) {
            videoIds.add(item.id.videoId);
            allVideos.push({
              videoId: item.id.videoId,
              title: item.snippet.title,
              description: item.snippet.description,
              channelTitle: item.snippet.channelTitle,
              publishedAt: item.snippet.publishedAt,
              thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url
            });
          }
        }
      } catch (searchErr) {
        console.error(`[fetchYouTube] YouTube search error for query "${q}":`, searchErr.message);
        console.error(`[fetchYouTube] Error details:`, searchErr.response?.data || searchErr.response?.status || 'No response data');
        // Continue with next query if one fails
      }
    }

    if (allVideos.length === 0) {
      return [];
    }

    // Fetch video details including duration, view count, etc.
    const videoIdList = allVideos.map(v => v.videoId).slice(0, limit);
    try {
      const detailsRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          key: YOUTUBE_KEY,
          part: 'contentDetails,statistics',
          id: videoIdList.join(',')
        },
        timeout: 10000
      });

      const videoDetails = {};
      (detailsRes.data.items || []).forEach(video => {
        videoDetails[video.id] = {
          duration: video.contentDetails?.duration,
          viewCount: video.statistics?.viewCount,
          likeCount: video.statistics?.likeCount
        };
      });

      // Map videos with their details
      const videos = allVideos.slice(0, limit).map((video) => {
        const details = videoDetails[video.videoId] || {};
        
        // Parse duration (ISO 8601 format: PT1H2M10S)
        let durationText = 'Video Course';
        if (details.duration) {
          const match = details.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          if (match) {
            const hours = parseInt(match[1] || 0);
            const minutes = parseInt(match[2] || 0);
            const seconds = parseInt(match[3] || 0);
            if (hours > 0) {
              durationText = `${hours}h ${minutes}m`;
            } else if (minutes > 0) {
              durationText = `${minutes}m`;
            } else {
              durationText = `${seconds}s`;
            }
          }
        }

        return {
          title: video.title,
          platform: 'YouTube',
          description: video.description || '',
          link: `https://www.youtube.com/watch?v=${video.videoId}`,
          channelTitle: video.channelTitle,
          publishedAt: video.publishedAt,
          thumbnail: video.thumbnail,
          duration: durationText,
          viewCount: details.viewCount ? parseInt(details.viewCount) : null,
          likeCount: details.likeCount ? parseInt(details.likeCount) : null
        };
      });

      console.log(`[fetchYouTube] Successfully fetched ${videos.length} YouTube videos`);
      return videos;
    } catch (detailsErr) {
      console.error('[fetchYouTube] YouTube video details error:', detailsErr.message);
      console.error('[fetchYouTube] Details error:', detailsErr.response?.data || detailsErr.response?.status || 'No response data');
      // Return videos without detailed stats if details fetch fails
      console.log(`[fetchYouTube] Returning ${allVideos.length} videos without detailed stats`);
      return allVideos.slice(0, limit).map((video) => ({
        title: video.title,
        platform: 'YouTube',
        description: video.description || '',
        link: `https://www.youtube.com/watch?v=${video.videoId}`,
        channelTitle: video.channelTitle,
        publishedAt: video.publishedAt,
        thumbnail: video.thumbnail,
        duration: 'Video Course'
      }));
    }
  } catch (err) {
    console.error('[fetchYouTube] Fatal error:', err.message);
    console.error('[fetchYouTube] Error stack:', err.stack);
    console.error('[fetchYouTube] Error response:', err.response?.data || err.response?.status || 'No response');
    return [];
  }
}

/**
 * Fetch courses by scraping e-learning platforms
 */
export async function fetchScrapedCourses(query, platform = 'all', limit = 5) {
  try {
    const platforms = platform === 'all' 
      ? ['khanacademy', 'freecodecamp', 'codecademy']
      : [platform.toLowerCase()];
    
    console.log(`[fetchScrapedCourses] Scraping platforms: ${platforms.join(', ')} for query: "${query}"`);
    const courses = await scrapeElearningPlatforms(query, platforms, limit);
    console.log(`[fetchScrapedCourses] Retrieved ${courses.length} courses from scraped platforms`);
    return courses;
  } catch (error) {
    console.error('[fetchScrapedCourses] Error:', error.message);
    console.error('[fetchScrapedCourses] Stack:', error.stack);
    return [];
  }
}

/**
 * Main helper: fetch courses from providers.
 * provider can be 'coursera', 'youtube', 'khanacademy', 'freecodecamp', 'codecademy', 'pluralsight', 'skillshare', 'scraped' (all scraped), or 'all'. (udemy & edx removed)
 */
export default async function fetchCourses(query, provider = 'all', limit = 5) {
  const results = [];
  const lim = Number(limit) || 5;

  console.log(`[CourseFetcher] Starting fetch - query: "${query}", provider: "${provider}", limit: ${lim}`);

  // API-based providers
  if (provider === 'coursera' || provider === 'all') {
    try {
      console.log(`[CourseFetcher] Fetching from Coursera...`);
      const c = await fetchCoursera(query, lim);
      console.log(`[CourseFetcher] Coursera returned ${c.length} courses`);
      results.push(...c);
    } catch (error) {
      console.error('[CourseFetcher] Coursera error:', error.message);
    }
  }

  if (provider === 'youtube' || provider === 'all') {
    try {
      console.log(`[CourseFetcher] Fetching from YouTube...`);
      const y = await fetchYouTube(query, lim);
      console.log(`[CourseFetcher] YouTube returned ${y.length} courses`);
      results.push(...y);
    } catch (error) {
      console.error('[CourseFetcher] YouTube error:', error.message);
    }
  }

  // Scraped providers
  const scrapedProviders = [
    'khanacademy', 'khan', 
    'freecodecamp', 'codecademy', 'pluralsight', 
    'skillshare', 'linkedin', 'linkedinlearning', 
    'futurelearn', 'scraped'
  ];
  const isScrapedProvider = scrapedProviders.includes(provider.toLowerCase());
  
  if (isScrapedProvider || provider === 'all') {
    try {
      const scrapedPlatform = provider === 'all' ? 'all' : provider.toLowerCase();
      console.log(`[CourseFetcher] Fetching scraped courses from: ${scrapedPlatform}...`);
      const scraped = await fetchScrapedCourses(query, scrapedPlatform, lim);
      console.log(`[CourseFetcher] Scraped platforms returned ${scraped.length} courses`);
      results.push(...scraped);
    } catch (error) {
      console.error('[CourseFetcher] Scraped courses error:', error.message);
      console.error('[CourseFetcher] Scraped courses stack:', error.stack);
    }
  }

  console.log(`[CourseFetcher] Total results before deduplication: ${results.length}`);

  // Deduplicate by link/title
  const seen = new Set();
  const dedup = [];
  for (const r of results) {
    const key = (r.link || r.title || '').toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      dedup.push(r);
    }
  }

  console.log(`[CourseFetcher] Total results after deduplication: ${dedup.length}`);
  return dedup.slice(0, lim * 3); // return up to a reasonable number (more since we have more sources)
}

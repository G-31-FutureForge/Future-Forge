import axios from 'axios';

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
    console.warn('YOUTUBE_API_KEY not set; YouTube fetch will return empty results.');
    return [];
  }

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
        console.error(`YouTube search error for query "${q}":`, searchErr.message);
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

      return videos;
    } catch (detailsErr) {
      console.error('YouTube video details error:', detailsErr.message);
      // Return videos without detailed stats if details fetch fails
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
    console.error('fetchYouTube error:', err.message);
    return [];
  }
}

/**
 * Main helper: fetch courses from providers.
 * provider can be 'coursera', 'youtube' or 'all'.
 */
export default async function fetchCourses(query, provider = 'all', limit = 5) {
  const results = [];
  const lim = Number(limit) || 5;

  if (provider === 'coursera' || provider === 'all') {
    const c = await fetchCoursera(query, lim);
    results.push(...c);
  }

  if (provider === 'youtube' || provider === 'all') {
    const y = await fetchYouTube(query, lim);
    results.push(...y);
  }

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

  return dedup.slice(0, lim * 2); // return up to a reasonable number
}

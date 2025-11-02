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
 */
export async function fetchYouTube(query, limit = 5) {
  if (!YOUTUBE_KEY) {
    console.warn('YOUTUBE_API_KEY not set; YouTube fetch will return empty results.');
    return [];
  }

  try {
    const q = `${query} course tutorial`;
    const searchRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: YOUTUBE_KEY,
        part: 'snippet',
        q,
        maxResults: limit,
        type: 'video'
      },
      timeout: 8000
    });

    const items = searchRes.data.items || [];
    const videos = items.map((it) => ({
      title: it.snippet.title,
      platform: 'YouTube',
      description: it.snippet.description,
      link: `https://www.youtube.com/watch?v=${it.id.videoId}`,
      channelTitle: it.snippet.channelTitle,
      publishedAt: it.snippet.publishedAt,
      thumbnail: it.snippet.thumbnails && it.snippet.thumbnails.default && it.snippet.thumbnails.default.url
    }));

    return videos;
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

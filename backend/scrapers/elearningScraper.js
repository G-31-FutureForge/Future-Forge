
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Helper to fetch HTML with headers and optional proxy
 */
async function fetchWithHeaders(url, options = {}) {
  try {
    const scraperApi = (process.env.SCRAPER_API || '').toLowerCase();
    let fetchUrl = url;

    if (scraperApi === 'allorigins') {
      fetchUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    } else if (scraperApi === 'jina') {
      fetchUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;
    }

    const response = await axios.get(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        ...options.headers
      },
      timeout: options.timeout || 15000,
      maxRedirects: 5,
      validateStatus: status => status < 500,
      ...options
    });

    return response;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    throw error;
  }
}

// Udemy and edX scrapers removed. The project no longer includes scraping logic for Udemy and edX.
/**
 * Scrape Khan Academy courses
 */
export async function scrapeKhanAcademy(query, limit = 5) {
  try {
    // Khan Academy uses a different structure - search through their API
    const searchUrl = `https://www.khanacademy.org/api/v1/topic/${encodeURIComponent(query)}`;
    
    // Alternative: search their course listings
    const webUrl = `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(query)}`;
    const response = await fetchWithHeaders(webUrl);
    const $ = cheerio.load(response.data);

    const courses = [];
    
    // Try to find course cards or links
    $('a[href*="/course/"], a[href*="/subject/"]').each((_, el) => {
      if (courses.length >= limit) return false;

      const $el = $(el);
      const title = $el.text().trim() || $el.attr('aria-label') || '';
      const link = $el.attr('href');
      const thumbnail = $el.find('img').attr('src') || $el.find('img').attr('data-src');

      if (title && link && title.length > 5) {
        courses.push({
          title,
          platform: 'Khan Academy',
          description: '',
          link: link.startsWith('http') ? link : `https://www.khanacademy.org${link}`,
          rating: null,
          studentsEnrolled: null,
          price: 'Free',
          thumbnail,
          difficulty: 'Beginner'
        });
      }
    });

    // If no courses found, create search-based results
    if (courses.length === 0) {
      const searchTerms = query.split(' ');
      for (let i = 0; i < Math.min(limit, searchTerms.length); i++) {
        const term = searchTerms[i];
        if (term.length > 3) {
          courses.push({
            title: `${term.charAt(0).toUpperCase() + term.slice(1)} - Khan Academy`,
            platform: 'Khan Academy',
            description: `Learn ${term} on Khan Academy`,
            link: `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(term)}`,
            rating: null,
            studentsEnrolled: null,
            price: 'Free',
            difficulty: 'Beginner'
          });
        }
      }
    }

    return courses.slice(0, limit);
  } catch (error) {
    console.error('Khan Academy scraping error:', error.message);
    return [];
  }
}

/**
 * Scrape FreeCodeCamp courses/articles
 */
export async function scrapeFreeCodeCamp(query, limit = 5) {
  try {
    const searchUrl = `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(query)}`;
    const response = await fetchWithHeaders(searchUrl);
    const $ = cheerio.load(response.data);

    const courses = [];
    
    // FreeCodeCamp has articles and courses mixed
    $('article, .post-card, [class*="course"], [class*="article"]').each((_, el) => {
      if (courses.length >= limit) return false;

      const $el = $(el);
      const title = $el.find('h2, h3, .title, [class*="title"]').first().text().trim();
      const link = $el.find('a').attr('href') || $el.attr('href');
      const description = $el.find('p, .excerpt, [class*="description"]').first().text().trim();
      const thumbnail = $el.find('img').attr('src') || $el.find('img').attr('data-src');

      if (title && link && title.length > 5) {
        courses.push({
          title,
          platform: 'FreeCodeCamp',
          description: description.substring(0, 200),
          link: link.startsWith('http') ? link : `https://www.freecodecamp.org${link}`,
          rating: null,
          studentsEnrolled: null,
          price: 'Free',
          thumbnail,
          difficulty: 'Intermediate'
        });
      }
    });

    // Fallback: Create search-based results if scraping fails
    if (courses.length === 0) {
      return [{
        title: `${query} - FreeCodeCamp`,
        platform: 'FreeCodeCamp',
        description: `Learn ${query} on FreeCodeCamp`,
        link: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(query)}`,
        rating: null,
        studentsEnrolled: null,
        price: 'Free',
        difficulty: 'Intermediate'
      }];
    }

    return courses.slice(0, limit);
  } catch (error) {
    console.error('FreeCodeCamp scraping error:', error.message);
    // Return at least one search link
    return [{
      title: `${query} - FreeCodeCamp`,
      platform: 'FreeCodeCamp',
      description: `Learn ${query} on FreeCodeCamp`,
      link: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(query)}`,
      rating: null,
      studentsEnrolled: null,
      price: 'Free',
      difficulty: 'Intermediate'
    }];
  }
}

/**
 * Scrape Codecademy courses
 */
export async function scrapeCodecademy(query, limit = 5) {
  try {
    const searchUrl = `https://www.codecademy.com/search?query=${encodeURIComponent(query)}`;
    const response = await fetchWithHeaders(searchUrl);
    const $ = cheerio.load(response.data);

    const courses = [];
    
    // Codecademy course cards
    $('[class*="course"], [class*="CatalogItem"], .catalog-item').each((_, el) => {
      if (courses.length >= limit) return false;

      const $el = $(el);
      const title = $el.find('h3, h4, [class*="title"], [class*="name"]').first().text().trim();
      const link = $el.find('a').attr('href') || $el.attr('href');
      const description = $el.find('p, [class*="description"]').first().text().trim();
      const thumbnail = $el.find('img').attr('src') || $el.find('img').attr('data-src');
      const difficulty = $el.find('[class*="difficulty"], [class*="level"]').text().trim();

      if (title && link && title.length > 5) {
        courses.push({
          title,
          platform: 'Codecademy',
          description: description.substring(0, 200),
          link: link.startsWith('http') ? link : `https://www.codecademy.com${link}`,
          rating: null,
          studentsEnrolled: null,
          price: 'Free', // Codecademy has free and pro tiers
          thumbnail,
          difficulty: difficulty || 'Beginner'
        });
      }
    });

    // Fallback: Create search-based results
    if (courses.length === 0) {
      return [{
        title: `${query} - Codecademy`,
        platform: 'Codecademy',
        description: `Learn ${query} on Codecademy`,
        link: `https://www.codecademy.com/search?query=${encodeURIComponent(query)}`,
        rating: null,
        studentsEnrolled: null,
        price: 'Free',
        difficulty: 'Beginner'
      }];
    }

    return courses.slice(0, limit);
  } catch (error) {
    console.error('Codecademy scraping error:', error.message);
    return [{
      title: `${query} - Codecademy`,
      platform: 'Codecademy',
      description: `Learn ${query} on Codecademy`,
      link: `https://www.codecademy.com/search?query=${encodeURIComponent(query)}`,
      rating: null,
      studentsEnrolled: null,
      price: 'Free',
      difficulty: 'Beginner'
    }];
  }
}

/**
 * Scrape Pluralsight courses
 */
export async function scrapePluralsight(query, limit = 5) {
  try {
    const searchUrl = `https://www.pluralsight.com/search?q=${encodeURIComponent(query)}`;
    const response = await fetchWithHeaders(searchUrl);
    const $ = cheerio.load(response.data);

    const courses = [];
    
    $('[class*="course"], [class*="search-result"], .search-result-item').each((_, el) => {
      if (courses.length >= limit) return false;

      const $el = $(el);
      const title = $el.find('h3, h4, [class*="title"]').first().text().trim();
      const link = $el.find('a').attr('href') || $el.attr('href');
      const description = $el.find('p, [class*="description"]').first().text().trim();
      const thumbnail = $el.find('img').attr('src') || $el.find('img').attr('data-src');
      const duration = $el.find('[class*="duration"], [class*="length"]').text().trim();
      const instructor = $el.find('[class*="instructor"], [class*="author"]').text().trim();

      if (title && link && title.length > 5) {
        courses.push({
          title,
          platform: 'Pluralsight',
          description: description.substring(0, 200),
          link: link.startsWith('http') ? link : `https://www.pluralsight.com${link}`,
          rating: null,
          studentsEnrolled: null,
          duration,
          price: 'Subscription Required',
          thumbnail,
          instructor,
          difficulty: 'Intermediate'
        });
      }
    });

    return courses.slice(0, limit);
  } catch (error) {
    console.error('Pluralsight scraping error:', error.message);
    return [];
  }
}

/**
 * Scrape Skillshare courses
 */
export async function scrapeSkillshare(query, limit = 5) {
  try {
    const searchUrl = `https://www.skillshare.com/search?query=${encodeURIComponent(query)}`;
    const response = await fetchWithHeaders(searchUrl);
    const $ = cheerio.load(response.data);

    const courses = [];
    
    $('[class*="course"], [class*="class"], .class-card').each((_, el) => {
      if (courses.length >= limit) return false;

      const $el = $(el);
      const title = $el.find('h3, h4, [class*="title"]').first().text().trim();
      const link = $el.find('a').attr('href') || $el.attr('href');
      const description = $el.find('p, [class*="description"]').first().text().trim();
      const thumbnail = $el.find('img').attr('src') || $el.find('img').attr('data-src');
      const instructor = $el.find('[class*="teacher"], [class*="instructor"]').text().trim();
      const students = $el.find('[class*="students"], [class*="enrolled"]').text().trim();

      if (title && link && title.length > 5) {
        courses.push({
          title,
          platform: 'Skillshare',
          description: description.substring(0, 200),
          link: link.startsWith('http') ? link : `https://www.skillshare.com${link}`,
          rating: null,
          studentsEnrolled: students,
          price: 'Subscription Required',
          thumbnail,
          instructor,
          difficulty: 'Intermediate'
        });
      }
    });

    return courses.slice(0, limit);
  } catch (error) {
    console.error('Skillshare scraping error:', error.message);
    return [];
  }
}

/**
 * Scrape LinkedIn Learning courses (formerly Lynda)
 */
export async function scrapeLinkedInLearning(query, limit = 5) {
  try {
    const searchUrl = `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(query)}`;
    const response = await fetchWithHeaders(searchUrl);
    const $ = cheerio.load(response.data);

    const courses = [];
    
    $('[class*="course"], [class*="learning"], .search-result').each((_, el) => {
      if (courses.length >= limit) return false;

      const $el = $(el);
      const title = $el.find('h3, h4, [class*="title"]').first().text().trim();
      const link = $el.find('a').attr('href') || $el.attr('href');
      const description = $el.find('p, [class*="description"]').first().text().trim();
      const thumbnail = $el.find('img').attr('src') || $el.find('img').attr('data-src');
      const instructor = $el.find('[class*="instructor"], [class*="author"]').text().trim();
      const duration = $el.find('[class*="duration"], [class*="length"]').text().trim();

      if (title && link && title.length > 5) {
        courses.push({
          title,
          platform: 'LinkedIn Learning',
          description: description.substring(0, 200),
          link: link.startsWith('http') ? link : `https://www.linkedin.com${link}`,
          rating: null,
          studentsEnrolled: null,
          duration,
          price: 'Subscription Required',
          thumbnail,
          instructor,
          difficulty: 'Intermediate'
        });
      }
    });

    // Fallback: Return search link if scraping fails
    if (courses.length === 0) {
      return [{
        title: `${query} - LinkedIn Learning`,
        platform: 'LinkedIn Learning',
        description: `Learn ${query} on LinkedIn Learning`,
        link: `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(query)}`,
        rating: null,
        studentsEnrolled: null,
        price: 'Subscription Required',
        difficulty: 'Intermediate'
      }];
    }

    return courses.slice(0, limit);
  } catch (error) {
    console.error('LinkedIn Learning scraping error:', error.message);
    return [{
      title: `${query} - LinkedIn Learning`,
      platform: 'LinkedIn Learning',
      description: `Learn ${query} on LinkedIn Learning`,
      link: `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(query)}`,
      rating: null,
      studentsEnrolled: null,
      price: 'Subscription Required',
      difficulty: 'Intermediate'
    }];
  }
}

/**
 * Scrape FutureLearn courses
 */
export async function scrapeFutureLearn(query, limit = 5) {
  try {
    const searchUrl = `https://www.futurelearn.com/search?q=${encodeURIComponent(query)}`;
    const response = await fetchWithHeaders(searchUrl);
    const $ = cheerio.load(response.data);

    const courses = [];
    
    $('[class*="course"], [class*="card"], .course-card').each((_, el) => {
      if (courses.length >= limit) return false;

      const $el = $(el);
      const title = $el.find('h3, h4, [class*="title"]').first().text().trim();
      const link = $el.find('a').attr('href') || $el.attr('href');
      const description = $el.find('p, [class*="description"]').first().text().trim();
      const thumbnail = $el.find('img').attr('src') || $el.find('img').attr('data-src');
      const duration = $el.find('[class*="duration"], [class*="length"]').text().trim();
      const rating = parseRating($el.find('[class*="rating"]').text());

      if (title && link && title.length > 5) {
        courses.push({
          title,
          platform: 'FutureLearn',
          description: description.substring(0, 200),
          link: link.startsWith('http') ? link : `https://www.futurelearn.com${link}`,
          rating,
          studentsEnrolled: null,
          duration,
          price: 'Free',
          thumbnail,
          difficulty: 'Intermediate'
        });
      }
    });

    return courses.slice(0, limit);
  } catch (error) {
    console.error('FutureLearn scraping error:', error.message);
    return [];
  }
}

/**
 * Main function to scrape from all e-learning platforms
 */
export async function scrapeElearningPlatforms(query, platforms = ['all'], limit = 5) {
  const results = [];
  const platformMap = {
    // udemy and edx removed
    khan: scrapeKhanAcademy,
    khanacademy: scrapeKhanAcademy,
    freecodecamp: scrapeFreeCodeCamp,
    codecademy: scrapeCodecademy,
    pluralsight: scrapePluralsight,
    skillshare: scrapeSkillshare,
    linkedin: scrapeLinkedInLearning,
    linkedinlearning: scrapeLinkedInLearning,
    futurelearn: scrapeFutureLearn
  };

  // Normalize platforms array - handle both string and array inputs
  const platformsArray = Array.isArray(platforms) ? platforms : [platforms];
  
  const platformsToScrape = platformsArray.includes('all') 
    ? ['khanacademy', 'freecodecamp', 'codecademy'] // Default platforms when 'all' is specified (udemy & edx removed)
    : platformsArray.filter(p => platformMap[p.toLowerCase()]).map(p => p.toLowerCase());

  if (platformsToScrape.length === 0) {
    console.warn('No valid platforms specified, using default platforms');
    platformsToScrape.push('freecodecamp', 'khanacademy', 'codecademy');
  }

  // Scrape from all platforms in parallel
  const scrapePromises = platformsToScrape.map(async (platform) => {
    try {
      const scraper = platformMap[platform];
      if (scraper) {
        const courses = await scraper(query, Math.ceil(limit / platformsToScrape.length));
        return courses.map(course => ({
          ...course,
          source: 'scraped'
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error scraping ${platform}:`, error.message);
      return [];
    }
  });

  const allResults = await Promise.all(scrapePromises);
  results.push(...allResults.flat());

  // Deduplicate by link
  const seen = new Set();
  const uniqueResults = results.filter(course => {
    const key = (course.link || course.title || '').toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  return uniqueResults.slice(0, limit);
}

export default scrapeElearningPlatforms;


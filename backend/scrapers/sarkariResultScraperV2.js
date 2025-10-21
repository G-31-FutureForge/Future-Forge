import axios from 'axios';
import * as cheerio from 'cheerio';

// Helper function to clean up and validate job data
function processJobData(title, link, baseUrl) {
  title = title.replace(/\s+/g, ' ').trim();

  if (!link || link.startsWith('#') || link.startsWith('javascript')) return null;

  if (!link.startsWith('http')) {
    try {
      link = new URL(link, baseUrl).href;
    } catch (e) {
      console.warn('Error processing URL:', e.message);
      return null;
    }
  }

  let qualification = 'all';
  const qualificationMap = {
    '10th': /(10th|matriculation|matric|secondary|sslc|class 10)/i,
    '12th': /(12th|intermediate|\+2|higher secondary|hssc|class 12)/i,
    'graduate': /(graduate|degree|ba|bsc|bcom|be|btech|b\.a\.|b\.sc\.|b\.com|b\.e\.|b\.tech)/i
  };

  Object.entries(qualificationMap).forEach(([level, pattern]) => {
    if (pattern.test(title)) {
      qualification = level;
    }
  });

  return { title, link, qualification };
}

// Main scraping function
export async function scrapeSarkariResultJobs() {
  const urls = [
    'https://www.sarkariresult.com',
    'https://sarkariresult.com',
    'https://www.sarkariresult.app',
    'https://rojgarresult.com'
  ];

  const jobs = new Set();

  for (const url of urls) {
    try {
      console.log(`Attempting to fetch from ${url}`);
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
          'Accept': 'text/html',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 30000,
        maxRedirects: 5,
        validateStatus: status => status < 500,
        httpsAgent: scraperApi ? undefined : new (await import('https')).Agent({ rejectUnauthorized: false })
      });

      const $ = cheerio.load(response.data);

      const selectors = [
        'div.postcontent ul li a',
        'div#latest ul li a',
        'div.list ul li a',
        'table.latestresult tr td a',
        'div#post table tr td a',
        'div.post h2 a',
        'article.post h2.entry-title a',
        '.result a',
        '.resultlink',
        '.latestresult a',
        'table tr td a',
        'div.content ul li a',
        'a[href*="recruitment"]',
        'a[href*="vacancy"]',
        'a[href*="jobs"]',
        'a[href*="result"]'
      ];

      let found = false;
      for (const selector of selectors) {
        $(selector).each((_, el) => {
          try {
            const $el = $(el);
            const title = $el.text();
            const link = $el.attr('href');

            const processedJob = processJobData(title, link, url);
            if (processedJob) {
              jobs.add(JSON.stringify({
                ...processedJob,
                source: 'Sarkari Result',
                postDate: new Date().toISOString()
              }));
              found = true;
            }
          } catch (err) {
            console.warn('Error processing element:', err.message);
          }
        });

        if (found || jobs.size >= 50) break;
      }

      if (jobs.size > 0) {
        console.log(`Successfully scraped ${jobs.size} jobs from ${url}`);
        break;
      }

    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      continue;
    }
  }

  const jobsArray = Array.from(jobs).map(job => JSON.parse(job));

  if (jobsArray.length === 0) {
    console.log('No jobs scraped, returning sample data');
    const fallbackJobs = [
      {
        title: "Indian Railways Group D Recruitment 2025 - 10th Pass Eligible",
        link: "https://indianrailways.gov.in/railways/careers",
        qualification: "10th",
        source: "Sarkari Result",
        postDate: new Date().toISOString()
      },
      {
        title: "UPSC Multi-Tasking Staff (MTS) 2025 - 10th Pass Vacancies",
        link: "https://www.upsc.gov.in/vacancies",
        qualification: "10th",
        source: "Sarkari Result",
        postDate: new Date().toISOString()
      },
      {
        title: "SSC GD Constable Recruitment 2025 - 10th Class Pass Apply Online",
        link: "https://ssc.nic.in",
        qualification: "10th",
        source: "Sarkari Result",
        postDate: new Date().toISOString()
      },
      {
        title: "Indian Post Office GDS Recruitment 2025 - 10th Pass Jobs",
        link: "https://www.indiapost.gov.in/careers",
        qualification: "10th",
        source: "Sarkari Result",
        postDate: new Date().toISOString()
      },
      {
        title: "Delhi Police Constable Recruitment 2025 - 10th Pass Required",
        link: "https://delhipolice.gov.in/recruitment",
        qualification: "10th",
        source: "Sarkari Result",
        postDate: new Date().toISOString()
      }
    ];

    return {
      jobs: fallbackJobs,
      source: 'fallback',
      error: 'Live scraping failed or site unreachable'
    };
  }

  return {
    jobs: jobsArray,
    source: 'live'
  };
}
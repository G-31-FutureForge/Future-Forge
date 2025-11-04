import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;
const JOOBLE_API_URL = 'https://jooble.org/api';

/**
 * Fetch jobs from Jooble API based on search criteria
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.keywords - Job keywords/title
 * @param {string} searchParams.location - Job location
 * @param {number} searchParams.page - Page number (default: 1)
 * @param {number} searchParams.radius - Search radius in km (default: 25)
 * @param {string} searchParams.salary - Salary range (e.g., "50000-100000")
 * @param {string} searchParams.type - Job type (full-time, part-time, contract, etc.)
 * @returns {Promise<Object>} - Jobs data from Jooble API
 */
export const fetchJoobleJobs = async (searchParams) => {
  try {
    if (!JOOBLE_API_KEY) {
      console.error('Jooble API key is not configured');
      throw new Error('Jooble API key is missing');
    }

    const {
      keywords = '',
      location = '',
      page = 1,
      radius = 25,
      salary = '',
      type = '',
      workType = ''
    } = searchParams;

    const payload = {
      keywords,
      location,
      page,
      radius,
    };

    // Add optional parameters
    if (salary) payload.salary = salary;
    if (type) payload.type = type;
    if (workType) payload.workType = workType;

    const response = await axios.post(
      `${JOOBLE_API_URL}/${JOOBLE_API_KEY}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds timeout
      }
    );

    return {
      success: true,
      jobs: response.data.jobs || [],
      totalPages: response.data.totalPages || 1,
      totalCount: response.data.totalCount || 0,
    };
  } catch (error) {
    console.error('Error fetching Jooble jobs:', error.message);
    
    if (error.response) {
      // API returned an error response
      return {
        success: false,
        error: error.response.data || 'Failed to fetch jobs from Jooble',
        jobs: [],
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        success: false,
        error: 'No response from Jooble API',
        jobs: [],
      };
    } else {
      // Error in setting up the request
      return {
        success: false,
        error: error.message,
        jobs: [],
      };
    }
  }
};

/**
 * Transform Jooble job data to our application format
 * @param {Array} joobleJobs - Jobs from Jooble API
 * @returns {Array} - Transformed jobs
 */
export const transformJoobleJobs = (joobleJobs) => {
  return joobleJobs.map((job) => ({
    _id: job.id || Math.random().toString(36).substr(2, 9),
    title: job.title || 'Untitled Position',
    company: job.company || 'Company Not Specified',
    location: job.location || 'Location Not Specified',
    jobType: normalizeJobType(job.type),
    salary: job.salary || 'Not Specified',
    description: job.snippet || job.description || 'No description available',
    skills: extractSkills(job.title, job.snippet),
    requirements: job.updated || '', // Jooble may provide updated date
    postedDate: job.updated || new Date().toISOString(),
    applicationDeadline: calculateDeadline(job.updated),
    link: job.link || '#',
    source: 'jooble',
    requiredQualification: determineQualification(job.title, job.snippet),
  }));
};

/**
 * Normalize job type from Jooble to our format
 * @param {string} joobleType - Job type from Jooble
 * @returns {string} - Normalized job type
 */
const normalizeJobType = (joobleType) => {
  const typeMap = {
    'Full-time': 'Full-time',
    'Part-time': 'Part-time',
    'Contract': 'Contract',
    'Temporary': 'Contract',
    'Internship': 'Internship',
    'Volunteer': 'Internship',
  };

  return typeMap[joobleType] || 'Full-time';
};

/**
 * Extract skills from job title and description
 * @param {string} title - Job title
 * @param {string} snippet - Job snippet/description
 * @returns {Array} - Extracted skills
 */
const extractSkills = (title = '', snippet = '') => {
  const text = `${title} ${snippet}`.toLowerCase();
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue',
    'sql', 'mongodb', 'postgresql', 'mysql', 'html', 'css', 'git',
    'aws', 'azure', 'docker', 'kubernetes', 'ci/cd', 'agile', 'scrum',
    'machine learning', 'ai', 'data science', 'big data', 'analytics',
    'marketing', 'sales', 'customer service', 'communication', 'leadership',
    'project management', 'finance', 'accounting', 'design', 'ui/ux',
  ];

  const foundSkills = commonSkills.filter((skill) => text.includes(skill));
  
  // Limit to 10 most relevant skills
  return foundSkills.slice(0, 10);
};

/**
 * Determine qualification based on job content
 * @param {string} title - Job title
 * @param {string} snippet - Job snippet
 * @returns {string} - Qualification level
 */
const determineQualification = (title = '', snippet = '') => {
  const text = `${title} ${snippet}`.toLowerCase();
  
  const graduateKeywords = [
    'bachelor', 'degree', 'graduate', 'bachelor\'s', 'ba ', 'bs ', 'bsc ',
    'university', 'college graduate', 'undergraduate'
  ];
  
  const experienceKeywords = [
    'experience', 'years', 'senior', 'lead', 'manager', 'director',
    '5 years', '10 years'
  ];

  if (graduateKeywords.some(keyword => text.includes(keyword))) {
    return 'graduate';
  }
  
  if (experienceKeywords.some(keyword => text.includes(keyword))) {
    return 'graduate';
  }
  
  return 'all';
};

/**
 * Calculate application deadline based on posted date
 * @param {string} postedDate - Posted date string
 * @returns {string} - Application deadline ISO string
 */
const calculateDeadline = (postedDate) => {
  try {
    const posted = new Date(postedDate);
    // Add 30 days to posted date
    const deadline = new Date(posted);
    deadline.setDate(deadline.getDate() + 30);
    return deadline.toISOString();
  } catch (error) {
    // Default to 30 days from now
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30);
    return deadline.toISOString();
  }
};


import fs from 'fs/promises';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load Indian Career Dataset
 */
let cachedDataset = null;

async function loadIndianCareerDataset() {
  if (cachedDataset) return cachedDataset;

  const datasetPath = path.join(__dirname, '../ml/indian_career_dataset.csv');
  const dataset = [];

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(datasetPath)
      .pipe(csv())
      .on('data', (row) => {
        dataset.push({
          educationLevel: row.education_level,
          stream: row.stream,
          skills: row.skills ? row.skills.split(',').map(s => s.trim()) : [],
          jobRole: row.job_role,
          industry: row.industry,
          experienceLevel: row.experience_level,
          salaryRange: row.salary_range,
          growthPotential: row.growth_potential,
          jobType: row.job_type,
          location: row.location
        });
      })
      .on('end', () => {
        cachedDataset = dataset;
        console.log(`[Career Dataset] Loaded ${dataset.length} career profiles`);
        resolve(dataset);
      })
      .on('error', reject);
  });
}

/**
 * Find matching careers from dataset
 */
function findMatchingCareers(educationLevel, interest, stream = '', preferredJobType = '') {
  let matches = cachedDataset.filter(career => {
    // Match education level
    if (educationLevel === 'After 10th' && career.educationLevel !== '12th Pass') return false;
    if (educationLevel === 'After 12th' && !['Bachelor', 'Diploma'].includes(career.educationLevel)) return false;
    if (educationLevel === 'Graduate' && !['Master\'s', 'PhD'].includes(career.educationLevel)) return false;

    // Match stream if provided
    if (stream && career.stream && !career.stream.toLowerCase().includes(stream.toLowerCase())) {
      // Check if interest matches the stream
      if (!career.skills.some(s => s.toLowerCase().includes(interest.toLowerCase()))) {
        return false;
      }
    }

    // Match interest in skills or job role
    if (interest) {
      const interestLower = interest.toLowerCase();
      const matchSkills = career.skills.some(s => s.toLowerCase().includes(interestLower));
      const matchRole = career.jobRole.toLowerCase().includes(interestLower);
      const matchIndustry = career.industry.toLowerCase().includes(interestLower);
      if (!matchSkills && !matchRole && !matchIndustry) return false;
    }

    // Match job type preference
    if (preferredJobType && !career.jobType.includes(preferredJobType)) return false;

    return true;
  });

  return matches.length > 0 ? matches : cachedDataset.slice(0, 10);
}

/**
 * Extract unique job roles for given education level and interests
 */
function extractJobRoles(careers) {
  const roles = new Set();
  careers.forEach(career => {
    roles.add(career.jobRole);
  });
  return Array.from(roles).slice(0, 6);
}

/**
 * Extract required skills from careers
 */
function extractSkills(careers) {
  const skillSet = new Set();
  careers.forEach(career => {
    career.skills.forEach(skill => skillSet.add(skill));
  });
  return Array.from(skillSet).slice(0, 8);
}

/**
 * Get salary information
 */
function getSalaryInfo(careers) {
  const salaries = careers.map(c => c.salaryRange).filter(Boolean);
  return salaries.length > 0 ? salaries[0] : 'Competitive';
}

/**
 * Get growth potential
 */
function getGrowthPotential(careers) {
  const potentials = careers.map(c => c.growthPotential).filter(Boolean);
  const average = potentials.length > 0 ? potentials[0] : 'Moderate';
  return average;
}

/**
 * Generate comprehensive career guidance from dataset
 */
export async function generateDatasetBasedGuidance(educationLevel, interest, stream = '', preferredJobType = '', careerGoal = '', preferredSkills = []) {
  // Load dataset
  await loadIndianCareerDataset();

  // Find matching careers
  const matchingCareers = findMatchingCareers(educationLevel, interest, stream, preferredJobType);

  // Group by job role to create career paths
  const careerPathMap = new Map();
  matchingCareers.forEach(career => {
    if (!careerPathMap.has(career.jobRole)) {
      careerPathMap.set(career.jobRole, []);
    }
    careerPathMap.get(career.jobRole).push(career);
  });

  // Create career paths (limit to top 5)
  const careerPaths = Array.from(careerPathMap.entries())
    .slice(0, 5)
    .map(([jobRole, careers]) => {
      const primaryCareer = careers[0];
      const allSkills = extractSkills(careers);
      const uniqueIndustries = [...new Set(careers.map(c => c.industry))];

      return {
        name: jobRole,
        description: `A promising career path in ${uniqueIndustries.join(', ')} sector. This role is well-suited for your education level and interests.`,
        industry: uniqueIndustries.join(', '),
        experienceLevel: primaryCareer.experienceLevel,
        salaryRange: primaryCareer.salaryRange,
        growthPotential: primaryCareer.growthPotential,
        skills: allSkills,
        skillGaps: preferredSkills.length > 0 
          ? preferredSkills.filter(ps => !allSkills.some(s => s.toLowerCase().includes(ps.toLowerCase())))
          : [],
        jobType: primaryCareer.jobType,
        locations: [...new Set(careers.map(c => c.location))].slice(0, 5),
        courses: generateCoursesFromPath(jobRole, allSkills, educationLevel),
        jobRoles: extractJobRoles(careers),
        roadmap: generateRoadmapForPath(jobRole, educationLevel, primaryCareer.experienceLevel)
      };
    });

  // Generate summary
  const summary = generateCareerSummary(educationLevel, interest, careerPaths, matchingCareers.length);

  return {
    career_paths: careerPaths,
    summary,
    dataset_matches: matchingCareers.length,
    top_locations: [...new Set(matchingCareers.map(c => c.location))].slice(0, 3),
    average_salary: getSalaryInfo(matchingCareers),
    growth_potential: getGrowthPotential(matchingCareers)
  };
}

/**
 * Generate courses for a career path
 */
function generateCoursesFromPath(jobRole, skills, educationLevel) {
  const courseMap = {
    // Programming roles
    'Junior Software Developer': [
      { name: 'Data Structures & Algorithms', type: 'Online Course', duration: '8 weeks', platform: 'Udemy/Coursera', description: 'Master fundamental programming concepts' },
      { name: 'Full Stack Web Development', type: 'Bootcamp', duration: '12 weeks', platform: 'Udacity', description: 'Build complete web applications' },
      { name: 'System Design', type: 'Online Course', duration: '6 weeks', platform: 'Coursera', description: 'Learn to design scalable systems' }
    ],
    'Frontend Developer': [
      { name: 'React.js Mastery', type: 'Online Course', duration: '10 weeks', platform: 'Udemy', description: 'Advanced React development skills' },
      { name: 'UI/UX Design Fundamentals', type: 'Certification', duration: '6 weeks', platform: 'Interaction Design Foundation', description: 'Learn design principles' },
      { name: 'Advanced CSS & JavaScript', type: 'Online Course', duration: '8 weeks', platform: 'Codecademy', description: 'Master frontend technologies' }
    ],
    'Backend Developer': [
      { name: 'Node.js & Express.js', type: 'Online Course', duration: '10 weeks', platform: 'Udemy', description: 'Backend development with Node.js' },
      { name: 'Database Design & SQL', type: 'Online Course', duration: '8 weeks', platform: 'DataCamp', description: 'Master database concepts' },
      { name: 'RESTful APIs Development', type: 'Online Course', duration: '6 weeks', platform: 'Coursera', description: 'Build scalable APIs' }
    ],
    'Data Analyst': [
      { name: 'Python for Data Analysis', type: 'Online Course', duration: '10 weeks', platform: 'Udemy', description: 'Data analysis with Python and pandas' },
      { name: 'SQL for Data Analytics', type: 'Online Course', duration: '8 weeks', platform: 'DataCamp', description: 'Query and analyze data' },
      { name: 'Tableau & Power BI', type: 'Certification', duration: '6 weeks', platform: 'Udacity', description: 'Data visualization tools' }
    ],
    'ML Engineer': [
      { name: 'Machine Learning Specialization', type: 'Degree Program', duration: '6 months', platform: 'Coursera', description: 'Comprehensive ML training' },
      { name: 'Deep Learning with TensorFlow', type: 'Online Course', duration: '12 weeks', platform: 'Udacity', description: 'Neural networks and deep learning' },
      { name: 'NLP & Computer Vision', type: 'Online Course', duration: '10 weeks', platform: 'Fast.ai', description: 'Advanced ML applications' }
    ],
    'Data Entry Operator': [
      { name: 'MS Office Suite Mastery', type: 'Online Course', duration: '4 weeks', platform: 'Udemy', description: 'Excel, Word, PowerPoint' },
      { name: 'Typing & Data Management', type: 'Certification', duration: '3 weeks', platform: 'NIIT', description: 'Speed and accuracy improvement' }
    ],
    'DevOps Engineer': [
      { name: 'Docker & Kubernetes', type: 'Online Course', duration: '12 weeks', platform: 'Linux Academy', description: 'Container orchestration' },
      { name: 'AWS Solutions Architect', type: 'Certification', duration: '10 weeks', platform: 'A Cloud Guru', description: 'Cloud infrastructure' },
      { name: 'CI/CD Pipelines', type: 'Online Course', duration: '8 weeks', platform: 'Udemy', description: 'Continuous integration and deployment' }
    ],
    'Teacher': [
      { name: 'Teaching Certification', type: 'Degree Program', duration: '1 year', platform: 'University', description: 'Formal teaching qualification' },
      { name: 'Pedagogy & Instructional Design', type: 'Online Course', duration: '8 weeks', platform: 'Coursera', description: 'Modern teaching methods' }
    ],
    'Finance Manager': [
      { name: 'Financial Management', type: 'Degree Program', duration: '2 years', platform: 'MBA Program', description: 'Advanced finance knowledge' },
      { name: 'CFA Level 1', type: 'Certification', duration: '3 months', platform: 'CFA Institute', description: 'Investment analysis certification' }
    ]
  };

  // Return specific courses if available
  const courses = courseMap[jobRole] || generateGenericCourses(skills);
  return courses.slice(0, 4);
}

/**
 * Generate generic courses based on skills
 */
function generateGenericCourses(skills) {
  const baseSkillCourses = {
    'Programming': { name: 'Programming Fundamentals', type: 'Online Course', duration: '8 weeks', platform: 'Udemy', description: 'Learn programming basics' },
    'Communication': { name: 'Professional Communication', type: 'Online Course', duration: '4 weeks', platform: 'LinkedIn Learning', description: 'Enhance communication skills' },
    'Leadership': { name: 'Leadership & Management', type: 'Online Course', duration: '6 weeks', platform: 'Coursera', description: 'Develop leadership abilities' },
    'Analytics': { name: 'Data Analytics', type: 'Online Course', duration: '10 weeks', platform: 'DataCamp', description: 'Master data analysis tools' }
  };

  const courses = [];
  skills.forEach(skill => {
    for (const [key, course] of Object.entries(baseSkillCourses)) {
      if (skill.toLowerCase().includes(key.toLowerCase())) {
        courses.push(course);
      }
    }
  });

  return courses.length > 0 ? courses : [
    { name: 'Professional Development Bootcamp', type: 'Bootcamp', duration: '12 weeks', platform: 'General', description: 'Comprehensive skill building' }
  ];
}

/**
 * Generate career roadmap
 */
function generateRoadmapForPath(jobRole, educationLevel, experienceLevel) {
  const roadmapTemplates = {
    'Entry Level': [
      {
        step: 1,
        title: 'Complete Education',
        description: 'Finish your current education and obtain required qualifications',
        timeline: 'Month 1-6',
        actions: ['Complete coursework', 'Apply for internships', 'Build portfolio projects']
      },
      {
        step: 2,
        title: 'Get First Job',
        description: 'Land your first job in the field',
        timeline: 'Month 6-12',
        actions: ['Apply to companies', 'Prepare for interviews', 'Negotiate offer']
      },
      {
        step: 3,
        title: 'Build Foundation Skills',
        description: 'Develop core skills in your first year',
        timeline: 'Year 1-2',
        actions: ['Learn from mentors', 'Take on challenging projects', 'Build professional network']
      },
      {
        step: 4,
        title: 'Develop Expertise',
        description: 'Become proficient in your role',
        timeline: 'Year 2-3',
        actions: ['Lead small projects', 'Mentor juniors', 'Get certifications']
      },
      {
        step: 5,
        title: 'Career Growth',
        description: 'Move to senior roles or specialization',
        timeline: 'Year 3-5',
        actions: ['Target promotions', 'Explore specializations', 'Plan career trajectory']
      }
    ],
    'Mid-level': [
      {
        step: 1,
        title: 'Assess Current Skills',
        description: 'Evaluate your existing skills and identify gaps',
        timeline: 'Month 1-2',
        actions: ['Self-assessment', 'Gap analysis', 'Create learning plan']
      },
      {
        step: 2,
        title: 'Upskill & Certifications',
        description: 'Acquire new skills and certifications',
        timeline: 'Month 2-6',
        actions: ['Take courses', 'Complete certifications', 'Practice new skills']
      },
      {
        step: 3,
        title: 'Apply New Skills',
        description: 'Apply learned skills in current role',
        timeline: 'Month 6-12',
        actions: ['Lead new initiatives', 'Take challenging projects', 'Document achievements']
      },
      {
        step: 4,
        title: 'Transition/Promotion',
        description: 'Pursue promotion or role transition',
        timeline: 'Year 1-2',
        actions: ['Apply for positions', 'Network professionally', 'Negotiate advancement']
      },
      {
        step: 5,
        title: 'Senior Leadership',
        description: 'Move into leadership positions',
        timeline: 'Year 2-5',
        actions: ['Develop team', 'Strategic planning', 'Mentorship']
      }
    ],
    'Senior': [
      {
        step: 1,
        title: 'Strategic Planning',
        description: 'Plan your next career move strategically',
        timeline: 'Month 1-3',
        actions: ['Assess options', 'Define vision', 'Research opportunities']
      },
      {
        step: 2,
        title: 'Executive Preparation',
        description: 'Prepare for executive roles',
        timeline: 'Month 3-6',
        actions: ['Executive coaching', 'Leadership training', 'Build executive network']
      },
      {
        step: 3,
        title: 'Leadership Transition',
        description: 'Transition to leadership positions',
        timeline: 'Month 6-12',
        actions: ['Apply for executive roles', 'Lead organization', 'Set strategic vision']
      },
      {
        step: 4,
        title: 'Mentorship & Legacy',
        description: 'Mentor emerging talent and build legacy',
        timeline: 'Year 1-3',
        actions: ['Mentor juniors', 'Knowledge transfer', 'Industry recognition']
      },
      {
        step: 5,
        title: 'Continued Impact',
        description: 'Continue making strategic impact',
        timeline: 'Year 3+',
        actions: ['Strategic initiatives', 'Board positions', 'Industry leadership']
      }
    ]
  };

  const levelKey = experienceLevel === 'Entry Level' ? 'Entry Level' 
                  : experienceLevel === 'Mid-level' ? 'Mid-level' 
                  : 'Senior';

  return roadmapTemplates[levelKey] || roadmapTemplates['Entry Level'];
}

/**
 * Generate career summary
 */
function generateCareerSummary(educationLevel, interest, careerPaths, totalMatches) {
  const pathNames = careerPaths.map(p => p.name).join(', ');
  
  let summary = `Based on your education level (${educationLevel}) and interest in ${interest}, we've identified ${totalMatches} matching career profiles.\n\n`;
  summary += `The top recommended career paths are: ${pathNames}.\n\n`;
  summary += `These careers offer:\n`;
  summary += `• Strong growth potential in the coming years\n`;
  summary += `• Competitive salaries with advancement opportunities\n`;
  summary += `• Multiple specialization paths based on your interests\n`;
  summary += `• Availability across major Indian cities\n\n`;
  summary += `Each path includes specific skills to develop, courses to take, and a step-by-step roadmap for your success. Start with the foundational courses and build your expertise progressively.`;

  return summary;
}

export default {
  generateDatasetBasedGuidance,
  loadIndianCareerDataset
};

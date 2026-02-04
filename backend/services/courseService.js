import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, '../ml/career_guidance_dataset.csv');

/**
 * Proper CSV parser for this specific format
 * Columns 0-8 are: education_level, stream, interests, skills, career_path, description, recommended_courses, colleges, exams
 * The rest (9+) are mixed data (colleges, salary, demand, jobs, skills, locations)
 */
const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const line = lines[i];
    const values = line.split(',').map(v => v.trim());
    const obj = {};

    // Map only the first 6 main columns we care about
    obj['education_level'] = values[0] || '';
    obj['stream'] = values[1] || '';
    obj['interests'] = values[2] || '';
    obj['skills'] = values[3] || '';
    obj['career_path'] = values[4] || '';
    obj['description'] = values[5] || '';
    obj['recommended_courses'] = values[6] || '';
    obj['colleges'] = values[7] || '';
    obj['exams'] = values[8] || '';
    
    // Find salary, demand, jobs by position logic
    // avg_salary should be position where we see ₹ or similar patterns
    let salaryIdx = -1;
    for (let j = 9; j < values.length; j++) {
      if (values[j].includes('₹') || values[j].match(/\d+.*LPA/)) {
        salaryIdx = j;
        break;
      }
    }
    
    obj['avg_salary'] = salaryIdx >= 0 ? values[salaryIdx] : 'N/A';
    
    // Find demand (Very High, High, Medium, Low)
    let demandIdx = -1;
    for (let j = 9; j < values.length; j++) {
      if (values[j].match(/Very High|High|Medium|Low/i)) {
        demandIdx = j;
        break;
      }
    }
    
    obj['demand_level'] = demandIdx >= 0 ? values[demandIdx] : 'Medium';
    
    // job_roles are between demand and the end (or skills_required)
    // Collect remaining values as job roles and skills
    const jobRolesArray = [];
    const skillsReqArray = [];
    
    for (let j = 9; j < values.length; j++) {
      const val = values[j];
      // Skip salary, demand, growth_rate, percentage values
      if (!val.includes('₹') && 
          !val.match(/Very High|High|Medium|Low|%|annually|Years/) &&
          val.length > 0) {
        jobRolesArray.push(val);
      }
    }
    
    // Split job roles from skills (roughly first half are job roles, second half are skills)
    if (jobRolesArray.length > 0) {
      const midpoint = Math.ceil(jobRolesArray.length / 2);
      obj['job_roles'] = jobRolesArray.slice(0, midpoint).join(', ');
      obj['skills_required'] = jobRolesArray.slice(midpoint).join(', ');
    } else {
      obj['job_roles'] = '';
      obj['skills_required'] = '';
    }
    
    data.push(obj);
  }

  return data;
};

/**
 * Normalize education level input
 */
const normalizeEducationLevel = (level) => {
  const normalized = level.toLowerCase().trim();
  
  if (normalized.includes('10') || normalized === 'after 10th') return 'after10th';
  if (normalized.includes('12') || normalized === 'after 12th') return 'after12th';
  if (normalized.includes('grad') || normalized === 'graduation') return 'graduation';
  
  return normalized;
};

/**
 * Determine course type based on name and education level
 */
const getCourseType = (courseName, educationLevel) => {
  const lower = courseName.toLowerCase();
  
  if (educationLevel === 'after10th') {
    if (lower.includes('diploma')) return 'Diploma Courses';
    if (lower.includes('iti') || lower.includes('vocational')) return 'ITI / Vocational Courses';
    if (lower.includes('polytechnic')) return 'Polytechnic Options';
    if (lower.includes('certification') || lower.includes('certified') || lower.includes('course')) return 'Skill-Based Certifications';
    if (lower.includes('trade')) return 'ITI / Vocational Courses';
    return 'Skill-Based Certifications';
  }
  
  if (educationLevel === 'after12th') {
    if (lower.includes('btech') || lower.includes('b.tech') || lower.includes('engineering')) return 'Undergraduate Degrees';
    if (lower.includes('bcom') || lower.includes('b.com') || lower.includes('bba') || lower.includes('ba') || lower.includes('b.a') || lower.includes('bsc')) return 'Undergraduate Degrees';
    if (lower.includes('mbbs') || lower.includes('bds') || lower.includes('medical') || lower.includes('dental')) return 'Professional Courses';
    if (lower.includes('neet') || lower.includes('jee') || lower.includes('clat') || lower.includes('gate') || lower.includes('upsc')) return 'Government Exam Paths';
    if (lower.includes('certification') || lower.includes('certified')) return 'Skill-Oriented Certifications';
    return 'Skill-Oriented Certifications';
  }
  
  if (educationLevel === 'graduation') {
    if (lower.includes('mtech') || lower.includes('m.tech') || lower.includes('mba') || lower.includes('ma') || lower.includes('m.a') || lower.includes('mcom') || lower.includes('m.com')) return 'Post-Graduate Degrees';
    if (lower.includes('certification') || lower.includes('certified') || lower.includes('specialization')) return 'Specialized Certifications';
    if (lower.includes('career switch') || lower.includes('career change')) return 'Career Switch Options';
    if (lower.includes('job') || lower.includes('position') || lower.includes('role') || lower.includes('developer') || lower.includes('analyst') || lower.includes('engineer') || lower.includes('manager')) return 'Direct Job Roles';
    if (lower.includes('startup') || lower.includes('freelance') || lower.includes('entrepreneur')) return 'Startup / Freelancing Paths';
    return 'Post-Graduate Degrees';
  }
  
  return 'Other';
};

/**
 * Extract duration from course data
 */
const extractDuration = (courseString) => {
  if (!courseString) return 'Variable';
  
  const durationMatch = courseString.match(/(\d+)\s*(?:year|month|week)/i);
  if (durationMatch) {
    const timeUnit = durationMatch[0].match(/year|month|week/i)[0];
    return `${durationMatch[1]} ${timeUnit}${parseInt(durationMatch[1]) > 1 ? 's' : ''}`;
  }
  
  // Default durations based on course type
  if (courseString.toLowerCase().includes('diploma')) return '3 Years';
  if (courseString.toLowerCase().includes('iti')) return '2 Years';
  if (courseString.toLowerCase().includes('mbbs')) return '5-6 Years';
  if (courseString.toLowerCase().includes('degree')) return '4 Years';
  
  return 'Variable';
};

/**
 * Generate structured JSON from CSV data - organized by course type
 */
const generateCoursesJSON = (csvData, educationLevel) => {
  const filteredRows = csvData.filter(row =>
    row.education_level && normalizeEducationLevel(row.education_level) === educationLevel
  );

  if (filteredRows.length === 0) {
    return {
      educationLevel: educationLevel,
      streams: [],
      coursesByType: {},
      totalCourses: 0
    };
  }

  const coursesMap = new Map();
  const streamsSet = new Set();

  // Extract unique courses with career paths
  filteredRows.forEach(row => {
    if (row.career_path && row.career_path.trim()) {
      const courseKey = (row.career_path + row.stream).toLowerCase();
      const courseType = getCourseType(row.career_path, educationLevel);
      
      if (!coursesMap.has(courseKey)) {
        const careerPaths = new Set();
        
        // Extract career paths from job_roles column
        if (row.job_roles && row.job_roles.trim()) {
          row.job_roles.split(',').forEach(path => {
            const trimmedPath = path.trim();
            if (trimmedPath && trimmedPath.length > 2) {
              careerPaths.add(trimmedPath);
            }
          });
        }

        const courseObj = {
          courseName: row.career_path.trim(),
          courseType: courseType,
          duration: extractDuration(row.career_path),
          stream: row.stream ? row.stream.trim() : 'General',
          careerPaths: careerPaths,
          salary: row.avg_salary ? row.avg_salary.trim() : 'N/A',
          demand: row.demand_level ? row.demand_level.trim() : 'Medium',
          description: row.description ? row.description.trim() : ''
        };
        
        coursesMap.set(courseKey, courseObj);
      }
      
      streamsSet.add(row.stream.trim());
    }
  });

  // Convert to final format organized by course type
  const coursesByType = {};
  
  coursesMap.forEach((course, key) => {
    const courseType = course.courseType;
    const courseObj = {
      courseName: course.courseName,
      duration: course.duration,
      stream: course.stream,
      careerPaths: Array.from(course.careerPaths).slice(0, 5),
      salary: course.salary,
      demand: course.demand,
      description: course.description
    };
    
    if (!coursesByType[courseType]) {
      coursesByType[courseType] = [];
    }
    coursesByType[courseType].push(courseObj);
  });

  return {
    educationLevel: educationLevel,
    streams: Array.from(streamsSet).sort(),
    coursesByType: coursesByType,
    totalCourses: coursesMap.size
  };
};

/**
 * Parse CSV and generate structured course/career data
 */
export const getCoursesByEducationLevel = async (educationLevel) => {
  try {
    // Normalize education level
    const normalizedLevel = normalizeEducationLevel(educationLevel);
    
    // Read CSV file
    const csvData = fs.readFileSync(CSV_PATH, 'utf-8');
    
    // Parse CSV
    const parsedData = parseCSV(csvData);
    
    const courses = generateCoursesJSON(parsedData, normalizedLevel);
    return courses;
  } catch (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }
};

/**
 * Get all available education levels
 */
export const getAvailableEducationLevels = async () => {
  try {
    const csvData = fs.readFileSync(CSV_PATH, 'utf-8');
    const parsedData = parseCSV(csvData);
    
    const levels = new Set(
      parsedData
        .map(row => row.education_level)
        .filter(Boolean)
    );
    return Array.from(levels);
  } catch (error) {
    throw new Error(`Failed to fetch education levels: ${error.message}`);
  }
};

import pdf from 'pdf-parse';
import fs from 'fs';

// Common skills database for matching
const SKILLS_DATABASE = {
  'programming': ['python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'kotlin', 'swift', 'typescript', 'nodejs', 'node.js'],
  'frontend': ['react', 'vue', 'angular', 'html', 'css', 'tailwind', 'bootstrap', 'webpack', 'sass', 'less'],
  'backend': ['express', 'django', 'flask', 'spring', 'laravel', 'asp.net', 'rails', 'fastapi', 'nextjs', 'next.js'],
  'database': ['mongodb', 'mysql', 'postgresql', 'oracle', 'redis', 'dynamodb', 'cassandra', 'elasticsearch'],
  'devops': ['docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'aws', 'azure', 'gcp', 'terraform', 'ansible'],
  'ml_ai': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'keras', 'nlp', 'computer vision', 'neural networks'],
  'data': ['data science', 'data analysis', 'pandas', 'numpy', 'spark', 'hadoop', 'tableau', 'power bi', 'sql', 'analytics'],
  'mobile': ['react native', 'flutter', 'ios', 'android', 'swift', 'kotlin'],
  'tools': ['git', 'jira', 'slack', 'figma', 'postman', 'vscode', 'vim', 'linux', 'windows', 'macos'],
  'soft': ['communication', 'teamwork', 'leadership', 'problem solving', 'project management', 'agile', 'scrum']
};

/**
 * Extract text from PDF file
 */
export async function extractPdfText(filePath) {
  try {
    const pdfBuffer = fs.readFileSync(filePath);
    const data = await pdf(pdfBuffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to parse PDF: ' + error.message);
  }
}

/**
 * Extract skills from resume text
 */
export function extractSkillsFromText(resumeText) {
  const textLower = resumeText.toLowerCase();
  const foundSkills = new Map(); // skill -> category

  for (const [category, skills] of Object.entries(SKILLS_DATABASE)) {
    for (const skill of skills) {
      if (textLower.includes(skill)) {
        if (!foundSkills.has(skill)) {
          foundSkills.set(skill, category);
        }
      }
    }
  }

  return Array.from(foundSkills.entries()).map(([skill, category]) => ({
    skill,
    category
  }));
}

/**
 * Match extracted skills against ML model careers
 */
export function matchSkillsToCareer(extractedSkills, careerPaths) {
  const careerMatches = [];

  for (const career of careerPaths) {
    let matchScore = 0;
    const matchedSkills = [];

    // Check if any extracted skills are relevant to this career
    for (const { skill, category } of extractedSkills) {
      // Score higher for relevant categories
      const relevanceScore = getRelevanceScore(career.name, category);
      if (relevanceScore > 0) {
        matchScore += relevanceScore;
        matchedSkills.push(skill);
      }
    }

    careerMatches.push({
      ...career,
      skillMatchScore: matchScore,
      matchedSkills: [...new Set(matchedSkills)],
      skillMatchPercentage: Math.min((matchScore / extractedSkills.length) * 100, 100)
    });
  }

  // Sort by match score
  return careerMatches.sort((a, b) => b.skillMatchScore - a.skillMatchScore);
}

/**
 * Calculate relevance score based on career and skill category
 */
function getRelevanceScore(careerName, skillCategory) {
  const careerLower = careerName.toLowerCase();
  const scoreMap = {
    'data scientist': { 'ml_ai': 10, 'data': 10, 'programming': 5, 'database': 5 },
    'data analyst': { 'data': 10, 'database': 8, 'tools': 3 },
    'machine learning engineer': { 'ml_ai': 10, 'programming': 8, 'data': 5 },
    'full stack developer': { 'frontend': 8, 'backend': 8, 'database': 5, 'devops': 3 },
    'frontend developer': { 'frontend': 10, 'programming': 5, 'tools': 3 },
    'backend developer': { 'backend': 10, 'database': 8, 'devops': 3 },
    'devops engineer': { 'devops': 10, 'backend': 3, 'tools': 5 },
    'mobile developer': { 'mobile': 10, 'programming': 8 },
    'software engineer': { 'programming': 10, 'backend': 5, 'database': 5 },
    'web developer': { 'frontend': 8, 'backend': 8, 'database': 5 }
  };

  for (const [career, scores] of Object.entries(scoreMap)) {
    if (careerLower.includes(career)) {
      return scores[skillCategory] || 0;
    }
  }

  // Default relevance
  return skillCategory === 'programming' ? 2 : 1;
}

/**
 * Generate skill-based recommendation
 */
export function generateSkillRecommendation(matchedCareers, extractedSkills) {
  const topCareer = matchedCareers[0];
  
  if (!topCareer) {
    return {
      recommendation: 'Unable to match skills to careers',
      topCareer: null,
      reason: 'No careers found',
      nextSteps: []
    };
  }

  const missingSkills = identifyMissingSkills(topCareer.name, extractedSkills);
  
  return {
    recommendation: `Based on your resume, ${topCareer.name} is an excellent match!`,
    topCareer: {
      name: topCareer.name,
      description: topCareer.description,
      matchPercentage: topCareer.skillMatchPercentage,
      matchedSkills: topCareer.matchedSkills
    },
    reason: `You have ${topCareer.matchedSkills.length} relevant skills for this role`,
    missingSkills: missingSkills.slice(0, 5),
    nextSteps: generateNextSteps(topCareer.name, missingSkills),
    alternativeCareer: matchedCareers[1] || null
  };
}

/**
 * Identify skills missing for a career
 */
function identifyMissingSkills(careerName, extractedSkills) {
  const extractedSkillNames = extractedSkills.map(s => s.skill);
  const careerLower = careerName.toLowerCase();
  
  const suggestedSkills = {
    'data scientist': ['machine learning', 'tensorflow', 'pandas', 'statistics', 'sql'],
    'data analyst': ['sql', 'power bi', 'excel', 'statistics', 'tableau'],
    'machine learning engineer': ['deep learning', 'pytorch', 'tensorflow', 'python', 'statistics'],
    'full stack developer': ['react', 'nodejs', 'mongodb', 'docker', 'git'],
    'frontend developer': ['react', 'typescript', 'css', 'webpack', 'testing'],
    'backend developer': ['express', 'mongodb', 'docker', 'redis', 'testing'],
    'devops engineer': ['docker', 'kubernetes', 'jenkins', 'terraform', 'aws'],
    'mobile developer': ['react native', 'swift', 'android', 'firebase', 'git']
  };

  for (const [career, skills] of Object.entries(suggestedSkills)) {
    if (careerLower.includes(career)) {
      return skills.filter(skill => !extractedSkillNames.some(s => s.includes(skill)));
    }
  }

  return [];
}

/**
 * Generate next steps for career development
 */
function generateNextSteps(careerName, missingSkills) {
  return [
    `Build projects showcasing your ${missingSkills[0] || 'technical'} skills`,
    `Complete courses in: ${missingSkills.slice(0, 2).join(', ') || 'your target area'}`,
    'Contribute to open-source projects',
    'Network with professionals in this field',
    'Prepare portfolio with relevant projects'
  ];
}

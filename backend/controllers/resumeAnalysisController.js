import { extractPdfText, extractSkillsFromText, matchSkillsToCareer, generateSkillRecommendation } from '../services/resumeSkillMatcher.js';
import { predictCareerFromProfile } from '../services/careerGuidanceModel.js';
import fs from 'fs/promises';

/**
 * Parse resume PDF and generate skill-based career recommendations
 */
export const handleResumeAnalysis = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF resume'
      });
    }

    // Check if file is PDF
    if (req.file.mimetype !== 'application/pdf') {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are supported'
      });
    }

    console.log('[Resume Analysis] Parsing PDF...');

    // Extract text from PDF
    let resumeText;
    try {
      resumeText = await extractPdfText(req.file.path);
      if (!resumeText || resumeText.trim().length === 0) {
        throw new Error('PDF appears to be empty or unreadable');
      }
    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        message: 'Failed to parse PDF: ' + parseError.message
      });
    }

    console.log('[Resume Analysis] Extracting skills...');

    // Extract skills from resume text
    const extractedSkills = extractSkillsFromText(resumeText);

    if (extractedSkills.length === 0) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        message: 'No recognizable skills found in resume. Please ensure your resume contains technical skills.'
      });
    }

    console.log(`[Resume Analysis] Found ${extractedSkills.length} skills:`, extractedSkills.map(s => s.skill).join(', '));

    console.log('[Resume Analysis] Getting ML career recommendations...');

    // Get career predictions from ML model using resume text
    const mlPrediction = await predictCareerFromProfile({
      resumeText: resumeText.substring(0, 2000), // Limit text for model
      educationLevel: 'Graduate'
    }).catch(err => {
      console.warn('[Resume Analysis] ML model failed:', err.message);
      return null;
    });

    // Get base career paths (from ML or default)
    let careerPaths = [];
    if (mlPrediction && mlPrediction.career_paths) {
      careerPaths = mlPrediction.career_paths;
    } else {
      // Default career paths if ML fails
      careerPaths = [
        { name: 'Software Engineer', description: 'Build and maintain software applications' },
        { name: 'Data Scientist', description: 'Analyze and interpret complex data' },
        { name: 'Full Stack Developer', description: 'Develop front-end and back-end solutions' },
        { name: 'Machine Learning Engineer', description: 'Create ML models and systems' },
        { name: 'DevOps Engineer', description: 'Manage infrastructure and deployment' }
      ];
    }

    console.log('[Resume Analysis] Matching skills to careers...');

    // Match skills to career recommendations
    const matchedCareers = matchSkillsToCareer(extractedSkills, careerPaths);

    // Generate personalized recommendation
    const recommendation = generateSkillRecommendation(matchedCareers, extractedSkills);

    // Clean up uploaded file
    await fs.unlink(req.file.path).catch(() => {});

    console.log('[Resume Analysis] Complete');

    return res.status(200).json({
      success: true,
      data: {
        resumeAnalysis: {
          totalSkillsFound: extractedSkills.length,
          extractedSkills: extractedSkills,
          skillsByCategory: groupSkillsByCategory(extractedSkills)
        },
        careerRecommendations: {
          primaryRecommendation: recommendation,
          allMatchedCareers: matchedCareers.slice(0, 5), // Top 5 matches
          totalMatches: matchedCareers.length
        }
      }
    });

  } catch (error) {
    console.error('[Resume Analysis] Error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message: 'Error analyzing resume',
      error: error.message
    });
  }
};

/**
 * Group skills by category for better organization
 */
function groupSkillsByCategory(extractedSkills) {
  const grouped = {};
  
  for (const { skill, category } of extractedSkills) {
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(skill);
  }

  return grouped;
}

import { generateCareerGuidance, parseResume, generateDiagramStructure } from '../services/careerGuidanceService.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Handle career guidance request
 */
export const handleCareerGuidance = async (req, res) => {
  try {
    const {
      educationLevel,
      interest,
      stream,
      preferredJobType,
      careerGoal,
      preferredSkills
    } = req.body;

    // Validate required fields
    if (!educationLevel) {
      return res.status(400).json({
        success: false,
        message: 'Education level is required'
      });
    }

    if (!interest && educationLevel !== 'Graduate' && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Area of interest is required'
      });
    }

    // For Graduate level, require either interest or resume
    if (educationLevel === 'Graduate' && !interest && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either area of interest or upload your resume'
      });
    }

    // Parse resume if provided (for Graduate level)
    let resumeText = '';
    if (req.file && educationLevel === 'Graduate') {
      try {
        resumeText = await parseResume(req.file.path);
        // Clean up uploaded file after parsing
        await fs.unlink(req.file.path).catch(() => {});
      } catch (parseError) {
        console.error('Resume parsing error:', parseError);
        return res.status(400).json({
          success: false,
          message: `Failed to parse resume: ${parseError.message}`
        });
      }
    }

    // Build user profile
    const userProfile = {
      educationLevel,
      interest: interest || '',
      stream: stream || '',
      preferredJobType: preferredJobType || '',
      careerGoal: careerGoal || '',
      preferredSkills: preferredSkills ? (Array.isArray(preferredSkills) ? preferredSkills : preferredSkills.split(',')) : [],
      resumeText
    };

    // Generate career guidance
    const careerData = await generateCareerGuidance(userProfile);

    // Generate diagram structure
    const diagramStructure = generateDiagramStructure(careerData, educationLevel);

    res.status(200).json({
      success: true,
      data: {
        careerPaths: careerData.career_paths || [],
        summary: careerData.summary || '',
        diagram: diagramStructure
      }
    });
  } catch (error) {
    console.error('Career guidance error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate career guidance'
    });
  }
};

/**
 * Health check for career guidance service
 */
export const checkCareerGuidanceHealth = async (req, res) => {
  try {
    const hfApiKey = process.env.HF_API_KEY;
    res.status(200).json({
      success: true,
      aiAvailable: Boolean(hfApiKey),
      message: 'Career guidance service is operational',
      provider: 'Hugging Face'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


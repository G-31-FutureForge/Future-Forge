import { parseFile } from '../utils/fileParser.js';
import extractSkills from '../services/skillExtractor.js';
import matchSkills from '../services/matcher.js';
import fetchResources from '../services/resourceFetcher.js';
import fs from 'fs/promises';
import path from 'path';

export const handleMatch = async (req, res) => {
  try {
    if (req.route.path === '/skill-analysis') {
      // Handle skill analysis request
      console.log('Processing skill analysis request');
      console.log('File path:', req.file.path);
      console.log('Job Description:', req.body.jobDescription);

      const resumeText = await parseFile(req.file.path);
      console.log('Parsed Resume Text:', resumeText.substring(0, 200) + '...'); // Log first 200 chars

      const jobText = req.body.jobDescription;
      
      // Extract skills
      const resumeSkills = extractSkills(resumeText);
      console.log('Extracted Resume Skills:', resumeSkills);
      
      const jobSkills = extractSkills(jobText);
      console.log('Extracted Job Skills:', jobSkills);

      const { matched, missing, extra } = matchSkills(resumeSkills, jobSkills);
      console.log('Matching Results:', { matched, missing, extra });
      
      // Ensure skills arrays are not empty
      const matchedSkills = matched || [];
      const missingSkills = missing || [];
      const extraSkills = extra || [];
      
      // Calculate job fit score based on matched vs required skills
      const totalRequired = [...new Set([...matchedSkills, ...missingSkills])].length || 1;
      const jobFitScore = Math.round((matchedSkills.length / totalRequired) * 100) || 0;

      // Get course recommendations
      const recommendedCourses = await fetchResources(missingSkills);

      const result = {
        jobFitScore,
        matchedSkills,
        missingSkills,
        extraSkills,
        recommendedCourses: recommendedCourses.map((course, index) => ({
          id: index + 1,
          ...course
        })),
        analysisDate: new Date().toISOString()
      };

      res.json(result);
    } else {
      // Handle regular job match request
      const resumeText = await parseFile(req.files.resume[0].path);
      const jobText = await parseFile(req.files.job[0].path);

      const resumeSkills = extractSkills(resumeText);
      const jobSkills = extractSkills(jobText);

      const { matched, missing, extra } = matchSkills(resumeSkills, jobSkills);
      const resources = await fetchResources(missing);

      res.json({ matched, missing, extra, resources });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Extract skills from resume and match with private sector jobs
 * POST /api/match/resume-jobs
 */
export const matchResumeWithJobs = async (req, res) => {
  let uploadedFilePath = null;
  try {
    console.log('Processing resume to job matching request');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request file:', req.file ? `${req.file.filename} (${req.file.size} bytes)` : 'No file');
    
    if (!req.file) {
      console.error('No resume file provided');
      return res.status(400).json({ 
        success: false,
        error: 'No resume file provided' 
      });
    }

    uploadedFilePath = req.file.path;

    if (!req.body.jobs) {
      console.error('No jobs data provided in request body');
      return res.status(400).json({ 
        success: false,
        error: 'No jobs data provided' 
      });
    }

    // Parse resume and extract skills
    console.log('Parsing resume from path:', req.file.path);
    let resumeText = '';
    try {
      resumeText = await parseFile(req.file.path);
    } catch (parseError) {
      console.error('Error parsing resume file:', parseError);
      return res.status(400).json({
        success: false,
        error: 'Failed to parse resume: ' + parseError.message
      });
    }

    console.log('Parsed Resume Text length:', resumeText.length);
    
    if (!resumeText || resumeText.trim().length === 0) {
      console.error('Resume text is empty after parsing');
      return res.status(400).json({
        success: false,
        error: 'Resume text could not be extracted. Please ensure your PDF contains text.'
      });
    }

    const resumeSkills = extractSkills(resumeText);
    console.log('Extracted Resume Skills:', resumeSkills);

    if (!resumeSkills || resumeSkills.length === 0) {
      console.warn('No skills extracted from resume');
      return res.status(400).json({
        success: false,
        error: 'No skills could be extracted from your resume. Please ensure it contains technical skills.'
      });
    }

    // Parse jobs data
    let jobs = [];
    try {
      jobs = typeof req.body.jobs === 'string' 
        ? JSON.parse(req.body.jobs) 
        : req.body.jobs;
    } catch (parseError) {
      console.error('Error parsing jobs data:', parseError);
      return res.status(400).json({
        success: false,
        error: 'Failed to parse jobs data: ' + parseError.message
      });
    }

    if (!Array.isArray(jobs)) {
      jobs = [jobs];
    }

    console.log('Number of jobs to match:', jobs.length);

    if (jobs.length === 0) {
      console.warn('No jobs provided for matching');
      return res.json({
        success: true,
        resumeSkills,
        totalJobsMatched: 0,
        totalJobsProcessed: 0,
        matchedJobs: [],
        allMatches: []
      });
    }

    // Match resume skills with each job
    const matchedJobs = jobs.map((job) => {
      try {
        const jobSkills = Array.isArray(job.skills) ? job.skills : [];
        const { matched, missing, extra } = matchSkills(resumeSkills, jobSkills);

        // Calculate match score
        const totalRequired = jobSkills.length || 1;
        const matchScore = Math.round((matched.length / totalRequired) * 100) || 0;
        const matchPercentage = totalRequired > 0 
          ? Math.round((matched.length / totalRequired) * 100) 
          : 0;

        return {
          ...job,
          matchData: {
            matchScore,
            matchPercentage,
            matchedSkills: matched,
            missingSkills: missing,
            extraSkills: extra,
            totalRequiredSkills: jobSkills.length,
            totalMatchedSkills: matched.length
          }
        };
      } catch (jobMatchError) {
        console.error('Error matching job:', job._id, jobMatchError);
        return {
          ...job,
          matchData: {
            matchScore: 0,
            matchPercentage: 0,
            matchedSkills: [],
            missingSkills: Array.isArray(job.skills) ? job.skills : [],
            extraSkills: [],
            totalRequiredSkills: Array.isArray(job.skills) ? job.skills.length : 0,
            totalMatchedSkills: 0
          }
        };
      }
    });

    // Sort by match score descending
    const sortedMatches = matchedJobs.sort(
      (a, b) => (b.matchData?.matchScore || 0) - (a.matchData?.matchScore || 0)
    );

    // Filter jobs with at least some skills match (optional, can adjust threshold)
    const filteredMatches = sortedMatches.filter(job => 
      (job.matchData?.matchedSkills?.length || 0) > 0
    );

    console.log(`✅ Matching complete: Found ${filteredMatches.length} jobs with at least one skill match out of ${jobs.length} total jobs`);

    res.json({
      success: true,
      resumeSkills,
      totalJobsMatched: filteredMatches.length,
      totalJobsProcessed: jobs.length,
      matchedJobs: filteredMatches,
      allMatches: sortedMatches
    });

  } catch (err) {
    console.error('❌ Error in matchResumeWithJobs:', err);
    res.status(500).json({ 
      success: false,
      error: err.message,
      details: err.stack
    });
  } finally {
    // Clean up uploaded file
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
        console.log('✅ Cleaned up uploaded file:', uploadedFilePath);
      } catch (cleanupError) {
        console.warn('Warning: Could not delete uploaded file:', uploadedFilePath, cleanupError.message);
      }
    }
  }
};
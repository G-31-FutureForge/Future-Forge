import { parseFile } from '../utils/fileParser.js';
import extractSkills from '../services/skillExtractor.js';
import matchSkills from '../services/matcher.js';
import fetchResources from '../services/resourceFetcher.js';

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
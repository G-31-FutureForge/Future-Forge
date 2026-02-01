import axios from 'axios';
import { parseFile } from '../utils/fileParser.js';
import { predictCareerFromProfile } from './careerGuidanceModel.js';

/**
 * Generate career guidance: tries trained ML model first (if USE_ML_MODEL/PREFER_ML_MODEL),
 * then falls back to Hugging Face API.
 * @param {Object} userProfile - User profile data
 * @returns {Promise<Object>} Career guidance data { career_paths, summary }
 */
export const generateCareerGuidance = async (userProfile) => {
  const { educationLevel, interest, stream, preferredJobType, resumeText, careerGoal, preferredSkills } = userProfile;

  // Try trained Kaggle/ML model first when enabled
  const useMl = process.env.USE_ML_MODEL === 'true' || process.env.PREFER_ML_MODEL === 'true';
  if (useMl) {
    try {
      const mlResult = await predictCareerFromProfile(userProfile);
      if (mlResult && Array.isArray(mlResult.career_paths) && mlResult.career_paths.length > 0) {
        console.log('[Career Guidance] Using trained ML model');
        return mlResult;
      }
    } catch (err) {
      console.warn('[Career Guidance] ML model failed, falling back to AI:', err?.message || err);
    }
  }

  // Build context based on education level
  let contextPrompt = '';
  
  if (educationLevel === 'After 10th') {
    contextPrompt = `
You are a career guidance expert helping a student who has completed 10th grade.

Student Profile:
- Education Level: After 10th
- Area of Interest: ${interest || 'Not specified'}
${careerGoal ? `- Career Goal: ${careerGoal}` : ''}
${preferredSkills ? `- Preferred Skills: ${preferredSkills.join(', ')}` : ''}

Tasks:
1. Suggest 3-5 suitable career paths based on their interest
2. List required skills for each career path
3. Recommend courses (short-term certifications & long-term degrees)
4. Suggest entry-level job roles they can target after completing education
5. Create a step-by-step career roadmap (1-5 years) for each path

Return output in JSON format with this structure:
{
  "career_paths": [
    {
      "name": "Career Path Name",
      "description": "Brief description",
      "skills": ["skill1", "skill2", "skill3"],
      "courses": [
        {
          "name": "Course Name",
          "type": "certification/degree",
          "duration": "duration",
          "description": "course description"
        }
      ],
      "job_roles": ["Role 1", "Role 2"],
      "roadmap": [
        {
          "step": 1,
          "title": "Step title",
          "description": "Step description",
          "timeline": "Year 1",
          "actions": ["action1", "action2"]
        }
      ]
    }
  ],
  "summary": "Overall career guidance summary"
}
`;
  } else if (educationLevel === 'After 12th') {
    contextPrompt = `
You are a career guidance expert helping a student who has completed 12th grade.

Student Profile:
- Education Level: After 12th
- Stream: ${stream || 'Not specified'}
- Area of Interest: ${interest || 'Not specified'}
${preferredJobType ? `- Preferred Job Type: ${preferredJobType}` : ''}

Tasks:
1. Suggest 3-5 suitable career paths based on their stream and interest
2. List required skills for each career path
3. Recommend degree programs and courses
4. Suggest entry-level job roles they can target after graduation
5. Create a step-by-step career roadmap (1-5 years) for each path

Return output in JSON format with this structure:
{
  "career_paths": [
    {
      "name": "Career Path Name",
      "description": "Brief description",
      "skills": ["skill1", "skill2", "skill3"],
      "courses": [
        {
          "name": "Course Name",
          "type": "degree/certification",
          "duration": "duration",
          "description": "course description"
        }
      ],
      "job_roles": ["Role 1", "Role 2"],
      "roadmap": [
        {
          "step": 1,
          "title": "Step title",
          "description": "Step description",
          "timeline": "Year 1",
          "actions": ["action1", "action2"]
        }
      ]
    }
  ],
  "summary": "Overall career guidance summary"
}
`;
  } else if (educationLevel === 'Graduate') {
    const resumeContext = resumeText 
      ? `\nResume Summary:\n${resumeText.substring(0, 2000)}...` 
      : '\nNote: No resume provided.';
    
    contextPrompt = `
You are a career guidance expert helping a graduate professional.

Student Profile:
- Education Level: Graduate
- Area of Interest: ${interest || 'Not specified'}
${careerGoal ? `- Career Goal: ${careerGoal}` : ''}
${resumeContext}

Tasks:
1. Analyze the profile and suggest 3-5 suitable career paths for upskilling/career transition
2. List required skills for each career path (highlight gaps)
3. Recommend upskilling courses and certifications
4. Suggest target job roles based on their profile
5. Create a step-by-step career roadmap (1-5 years) for career growth

Return output in JSON format with this structure:
{
  "career_paths": [
    {
      "name": "Career Path Name",
      "description": "Brief description",
      "skills": ["skill1", "skill2", "skill3"],
      "skill_gaps": ["gap1", "gap2"],
      "courses": [
        {
          "name": "Course Name",
          "type": "certification/degree",
          "duration": "duration",
          "description": "course description"
        }
      ],
      "job_roles": ["Role 1", "Role 2"],
      "roadmap": [
        {
          "step": 1,
          "title": "Step title",
          "description": "Step description",
          "timeline": "Month 1-3",
          "actions": ["action1", "action2"]
        }
      ]
    }
  ],
  "summary": "Overall career guidance summary"
}
`;
  }

  // Use Hugging Face API (free tier, no credit card required)
  // Alternative: Groq (fast) or Together AI
  const apiProvider = (process.env.AI_PROVIDER || 'huggingface').toLowerCase(); // 'groq', 'huggingface', 'together'
  
  console.log(`[Career Guidance] Using AI provider: ${apiProvider}`);
  
  let content = '';
  
  try {
    if (apiProvider === 'groq') {
      // Groq API - Fast and free
      const groqApiKey = process.env.GROQ_API_KEY;
      if (!groqApiKey) {
        console.error('[Career Guidance] GROQ_API_KEY not found in environment variables');
        throw new Error(
          'Groq API key is not configured. Get a free API key from https://console.groq.com/keys and add GROQ_API_KEY to your .env file. Then restart your server.'
        );
      }
      
      console.log('[Career Guidance] Calling Groq API...');
      
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are an expert career guidance counselor. Always respond with valid JSON only, no additional text.'
            },
            {
              role: 'user',
              content: contextPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      content = response.data.choices[0].message.content.trim();
      
    } else if (apiProvider === 'huggingface') {
      // Hugging Face Router API (api-inference.huggingface.co is deprecated → use router.huggingface.co)
      // OpenAI-compatible: https://router.huggingface.co/v1/chat/completions
      const hfRouterUrl = 'https://router.huggingface.co/v1/chat/completions';
      // Default model on router; override with HF_MODEL in .env (e.g. HuggingFaceTB/SmolLM3-3B-Instruct:hf-inference)
      const hfModel = process.env.HF_MODEL;
      const hfApiKey = process.env.HF_API_KEY;

      // Require explicit HF_MODEL to avoid using an invalid hard-coded default
      if (!hfModel) {
        throw new Error(
          'Hugging Face model is not configured. Set HF_MODEL in your .env to a valid model id (for example: "TheBloke/eroK/anything" or use any valid model from https://huggingface.co/models)'
        );
      }

      if (!hfApiKey) {
        console.error('[Career Guidance] HF_API_KEY not found in environment variables');
        throw new Error(
          'Hugging Face API key is not configured. Get a free token from https://huggingface.co/settings/tokens and add HF_API_KEY to your .env file. Then restart your server.'
        );
      }

      console.log('[Career Guidance] Calling Hugging Face Router API...');
      console.log(`[Career Guidance] Using model: ${hfModel}`);

      const response = await axios.post(
        hfRouterUrl,
        {
          model: hfModel,
          messages: [
            {
              role: 'system',
              content: 'You are an expert career guidance counselor. Always respond with valid JSON only, no additional text or explanations.'
            },
            {
              role: 'user',
              content: contextPrompt
            }
          ],
          max_tokens: 2048,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${hfApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 90000, // 90 second timeout (models may need to wake up)
        },
      );

      // OpenAI-compatible response: response.data.choices[0].message.content
      const msg = response.data.choices?.[0]?.message;
      if (!msg || typeof msg.content !== 'string') {
        throw new Error('Invalid response from Hugging Face: no message content');
      }
      content = msg.content.trim();
      
    } else if (apiProvider === 'together') {
      // Together AI API
      const togetherApiKey = process.env.TOGETHER_API_KEY;
      if (!togetherApiKey) {
        throw new Error(
          'Together AI API key is not configured. Get a free API key from https://api.together.xyz/ and add TOGETHER_API_KEY to your .env file.'
        );
      }
      
      const response = await axios.post(
        'https://api.together.xyz/v1/chat/completions',
        {
          model: 'meta-llama/Llama-3-8b-chat-hf',
          messages: [
            {
              role: 'system',
              content: 'You are an expert career guidance counselor. Always respond with valid JSON only, no additional text.'
            },
            {
              role: 'user',
              content: contextPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000
        },
        {
          headers: {
            'Authorization': `Bearer ${togetherApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      content = response.data.choices[0].message.content.trim();
    } else {
      throw new Error(`Unknown AI provider: ${apiProvider}. Use 'groq', 'huggingface', or 'together'`);
    }
    let careerData;
    
    try {
      careerData = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        careerData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    return careerData;
  } catch (error) {
    console.error('Error generating career guidance:', error);
    
    // Provide helpful error messages
    if (error.response) {
      // API returned an error response
      const status = error.response.status;
      const errorData = error.response.data;
      // Log full HF error body for easier debugging
      console.error('[Career Guidance] Hugging Face error response body:', JSON.stringify(errorData, null, 2));
      
      if (status === 401) {
        throw new Error(
          `Authentication failed. Please check your ${apiProvider.toUpperCase()} API key in the .env file. ` +
          `Get a free API key: ${apiProvider === 'groq' ? 'https://console.groq.com/keys' : apiProvider === 'huggingface' ? 'https://huggingface.co/settings/tokens' : 'https://api.together.xyz/'}`
        );
      } else if (status === 410) {
        const msg = errorData?.error || error.response?.headers?.['x-error-message'] || error.message;
        throw new Error(
          `Hugging Face API has changed. This app now uses the new router (router.huggingface.co). Restart your server to use the updated code. Details: ${msg}`
        );
      } else if (status === 429) {
        throw new Error('API rate limit exceeded. Please try again in a few moments.');
      } else if (status === 400) {
        // Model not found / invalid model id -> provide actionable guidance
        const hfMsg = errorData?.error?.message || errorData?.error || errorData?.message || JSON.stringify(errorData);
        const msg = String(hfMsg);
        if (msg.toLowerCase().includes('does not exist') || msg.toLowerCase().includes('model not found')) {
          throw new Error(`Model '${process.env.HF_MODEL || '<unspecified>'}' does not exist on Hugging Face. Update HF_MODEL in backend/.env to a valid model id from https://huggingface.co/models`);
        }
        // Surface the HF error body for diagnosis
        throw new Error(`Hugging Face API returned status 400: ${msg}`);
      } else {
        throw new Error(`API error (${status}): ${errorData?.error?.message || errorData?.error || error.message}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from AI service. Please check your internet connection and try again.');
    } else {
      // Error in setting up the request
      throw new Error(`Failed to generate career guidance: ${error.message}`);
    }
  }
};

/**
 * Parse resume file and extract text
 * @param {string} filePath - Path to resume file
 * @returns {Promise<string>} Extracted resume text
 */
export const parseResume = async (filePath) => {
  try {
    const resumeText = await parseFile(filePath);
    return resumeText;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
};

/**
 * Generate diagram structure from career data
 * @param {Object} careerData - Career guidance data
 * @param {string} educationLevel - User's education level
 * @returns {Object} Diagram structure for visualization
 */
export const generateDiagramStructure = (careerData, educationLevel) => {
  const nodes = [];
  const edges = [];
  let nodeId = 0;

  // Start node
  nodes.push({
    id: `start-${nodeId++}`,
    type: 'start',
    label: educationLevel,
    position: { x: 400, y: 50 }
  });

  const startNodeId = `start-${nodeId - 1}`;
  let currentY = 150;
  const pathSpacing = 300;

  // Process each career path
  careerData.career_paths?.forEach((path, pathIndex) => {
    const pathStartX = 200 + (pathIndex * pathSpacing);
    let localY = currentY;
    let lastNodeId = null;

    // Career path node
    const pathNodeId = `path-${nodeId++}`;
    nodes.push({
      id: pathNodeId,
      type: 'career-path',
      label: path.name,
      description: path.description,
      position: { x: pathStartX, y: localY }
    });
    edges.push({
      id: `edge-${nodeId}`,
      source: startNodeId,
      target: pathNodeId,
      type: 'smoothstep'
    });
    lastNodeId = pathNodeId;
    localY += 120;

    // Skills node
    if (path.skills && path.skills.length > 0) {
      const skillsNodeId = `skills-${nodeId++}`;
      nodes.push({
        id: skillsNodeId,
        type: 'skills',
        label: 'Required Skills',
        skills: path.skills,
        position: { x: pathStartX, y: localY }
      });
      edges.push({
        id: `edge-${nodeId}`,
        source: lastNodeId,
        target: skillsNodeId,
        type: 'smoothstep'
      });
      lastNodeId = skillsNodeId;
      localY += 120;
    }

    // Courses node
    if (path.courses && path.courses.length > 0) {
      const coursesNodeId = `courses-${nodeId++}`;
      nodes.push({
        id: coursesNodeId,
        type: 'courses',
        label: 'Recommended Courses',
        courses: path.courses,
        position: { x: pathStartX, y: localY }
      });
      edges.push({
        id: `edge-${nodeId}`,
        source: lastNodeId,
        target: coursesNodeId,
        type: 'smoothstep'
      });
      lastNodeId = coursesNodeId;
      localY += 120;
    }

    // Job roles node
    if (path.job_roles && path.job_roles.length > 0) {
      const jobsNodeId = `jobs-${nodeId++}`;
      nodes.push({
        id: jobsNodeId,
        type: 'jobs',
        label: 'Target Job Roles',
        jobs: path.job_roles,
        position: { x: pathStartX, y: localY }
      });
      edges.push({
        id: `edge-${nodeId}`,
        source: lastNodeId,
        target: jobsNodeId,
        type: 'smoothstep'
      });
    }
  });

  return {
    nodes,
    edges,
    summary: careerData.summary || ''
  };
};


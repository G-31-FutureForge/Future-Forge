const extractSkills = (text) => {
  if (!text || typeof text !== 'string') {
    console.log('Invalid input text:', text);
    return [];
  }
  
  console.log('Extracting skills from text length:', text.length);
  
  // Common variations of skills
  const skillVariations = {
    'javascript': ['js', 'javascript', 'ecmascript'],
    'nodejs': ['node.js', 'node js', 'nodejs'],
    'react': ['react.js', 'reactjs', 'react native'],
    'java': ['java', 'core java', 'java ee'],
    'python': ['python', 'python3', 'django', 'flask'],
    'sql': ['sql', 'mysql', 'postgresql', 'oracle'],
    'aws': ['aws', 'amazon web services', 'cloud'],
    'docker': ['docker', 'containerization'],
    'kubernetes': ['kubernetes', 'k8s'],
    'git': ['git', 'github', 'version control']
  };

  // Create regex pattern from variations
  const skillPatterns = Object.values(skillVariations)
    .flat()
    .map(skill => skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  const skillRegex = new RegExp(`\\b(${skillPatterns})\\b`, 'gi');
  
  // Extract skills
  const matches = text.match(skillRegex) || [];
  console.log('Raw matches:', matches);

  // Normalize and deduplicate skills
  const normalizedSkills = matches
    .map(match => match.toLowerCase())
    .filter((skill, index, self) => self.indexOf(skill) === index);

  console.log('Normalized skills:', normalizedSkills);
  return normalizedSkills;
};

export default extractSkills;
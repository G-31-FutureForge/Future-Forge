const extractSkills = (text) => {
  if (!text || typeof text !== 'string') {
    console.log('Invalid input text:', text);
    return [];
  }
  
  console.log('Extracting skills from text length:', text.length);
  
  // Common variations of skills
  const skillVariations = {
    // Programming Languages
    'javascript': ['js', 'javascript', 'ecmascript', 'es6', 'es2015'],
    'typescript': ['ts', 'typescript', 'typed javascript'],
    'python': ['python', 'python3', 'django', 'flask', 'fastapi'],
    'java': ['java', 'core java', 'java ee', 'spring', 'spring boot'],
    'cpp': ['c++', 'cpp', 'c plus plus'],
    'csharp': ['c#', 'csharp', '.net', 'asp.net'],
    'php': ['php', 'laravel', 'symfony'],
    
    // Web Technologies
    'html': ['html', 'html5', 'semantic html'],
    'css': ['css', 'css3', 'scss', 'sass', 'less', 'styled-components'],
    'react': ['react', 'react.js', 'reactjs', 'react native', 'next.js'],
    'angular': ['angular', 'angularjs', 'angular2+'],
    'vue': ['vue', 'vue.js', 'vuejs', 'nuxt'],
    'nodejs': ['node', 'node.js', 'nodejs', 'express.js', 'nestjs'],
    
    // Databases
    'sql': ['sql', 'mysql', 'postgresql', 'oracle', 'sqlite'],
    'mongodb': ['mongodb', 'mongoose', 'nosql'],
    'redis': ['redis', 'caching', 'in-memory database'],
    
    // Cloud & DevOps
    'aws': ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
    'azure': ['azure', 'microsoft azure'],
    'gcp': ['gcp', 'google cloud'],
    'docker': ['docker', 'containerization', 'container'],
    'kubernetes': ['kubernetes', 'k8s', 'container orchestration'],
    'jenkins': ['jenkins', 'ci/cd', 'continuous integration'],
    
    // Version Control
    'git': ['git', 'github', 'gitlab', 'bitbucket', 'version control'],
    
    // Testing
    'testing': ['unit testing', 'integration testing', 'e2e testing', 'jest', 'mocha'],
    
    // Development Tools
    'vscode': ['vs code', 'visual studio code', 'vscode'],
    'webpack': ['webpack', 'babel', 'bundler'],
    
    // Methodologies
    'agile': ['agile', 'scrum', 'kanban', 'jira'],
    'devops': ['devops', 'mlops', 'gitops'],
    
    // AI & ML
    'ml': ['machine learning', 'ml', 'deep learning', 'ai'],
    'data': ['data structures', 'algorithms', 'dsa']
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
    .map(match => match.toLowerCase().trim())
    .filter((skill, index, self) => self.indexOf(skill) === index);

  console.log('Normalized skills:', normalizedSkills);
  return normalizedSkills;
};

export default extractSkills;
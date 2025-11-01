const extractSkills = (text) => {
  if (!text || typeof text !== 'string') {
    console.log('Invalid input text:', text);
    return [];
  }
  
  console.log('Extracting skills from text length:', text.length);
  
  // Common variations of skills
  const skillVariations = {
    // Programming Languages
    'javascript': ['js', 'javascript', 'ecmascript', 'es6', 'es2015', 'es2020', 'es2021', 'node.js', 'nodejs'],
    'typescript': ['ts', 'typescript', 'typed javascript', 'tsc'],
    'python': ['python', 'python3', 'django', 'flask', 'fastapi', 'pytorch', 'tensorflow', 'pandas', 'numpy'],
    'java': ['java', 'core java', 'java ee', 'spring', 'spring boot', 'hibernate', 'maven', 'gradle'],
    'cpp': ['c++', 'cpp', 'c plus plus', 'stl', 'boost'],
    'csharp': ['c#', 'csharp', '.net', 'asp.net', '.net core', 'blazor', 'xamarin'],
    'rust': ['rust', 'cargo', 'rustc'],
    'go': ['golang', 'go'],
    'kotlin': ['kotlin', 'android development'],
    'swift': ['swift', 'ios development', 'swiftui'],
    
    // Web Technologies
    'html': ['html', 'html5', 'semantic html', 'web components'],
    'css': ['css', 'css3', 'scss', 'sass', 'less', 'styled-components', 'tailwind', 'bootstrap', 'material-ui'],
    'react': ['react', 'react.js', 'reactjs', 'react native', 'next.js', 'gatsby', 'redux', 'mobx', 'recoil'],
    'vue': ['vue', 'vue.js', 'vuejs', 'nuxt', 'vuex', 'vue router'],
    'angular': ['angular', 'angularjs', 'angular2+', 'ngrx', 'rxjs'],
    'web3': ['web3', 'ethereum', 'solidity', 'blockchain', 'smart contracts', 'defi', 'nft'],
    
    // Cloud & DevOps
    'aws': ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'dynamodb', 'cloudfront', 'eks', 'ecs'],
    'azure': ['azure', 'microsoft azure', 'azure functions', 'azure devops'],
    'gcp': ['gcp', 'google cloud', 'google cloud platform', 'cloud run', 'cloud functions'],
    'docker': ['docker', 'containerization', 'docker-compose', 'dockerfile'],
    'kubernetes': ['kubernetes', 'k8s', 'container orchestration', 'helm', 'openshift'],
    'terraform': ['terraform', 'infrastructure as code', 'iac'],
    'ci/cd': ['jenkins', 'github actions', 'gitlab ci', 'circle ci', 'travis ci', 'continuous integration'],
    
    // Databases
    'sql': ['sql', 'mysql', 'postgresql', 'oracle', 'sqlite', 'plsql', 'tsql'],
    'nosql': ['mongodb', 'mongoose', 'nosql', 'dynamodb', 'cassandra', 'couchbase'],
    'redis': ['redis', 'caching', 'in-memory database'],
    'elasticsearch': ['elasticsearch', 'elk stack', 'kibana', 'logstash'],
    'graphql': ['graphql', 'apollo', 'hasura'],
    
    // AI & ML
    'machine_learning': ['machine learning', 'ml', 'deep learning', 'neural networks', 'ai'],
    'data_science': ['data science', 'data analysis', 'big data', 'data visualization', 'statistics'],
    'nlp': ['natural language processing', 'nlp', 'transformers', 'bert', 'gpt'],
    'computer_vision': ['computer vision', 'opencv', 'image processing', 'object detection'],
    
    // Tools & Platforms
    'git': ['git', 'github', 'gitlab', 'bitbucket', 'version control'],
    'testing': ['unit testing', 'integration testing', 'e2e testing', 'jest', 'cypress', 'selenium', 'playwright'],
    'agile': ['agile', 'scrum', 'kanban', 'jira', 'confluence'],
    'security': ['cybersecurity', 'penetration testing', 'security', 'encryption', 'oauth', 'jwt'],
    
    // Emerging Tech
    'ai_ops': ['mlops', 'aiops', 'machine learning operations'],
    'iot': ['internet of things', 'iot', 'embedded systems', 'raspberry pi', 'arduino'],
    'ar_vr': ['augmented reality', 'virtual reality', 'ar', 'vr', 'unity3d', 'unreal engine'],
    'quantum': ['quantum computing', 'quantum', 'qiskit']
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
const fetchResources = async (skills) => {
  // Mock course data with realistic information
  const courseProviders = {
    'Udemy': { 
      type: 'paid', 
      baseRating: 4.5,
      priceRange: '$10-20',
      features: ['Lifetime access', 'Certificate', 'Downloadable resources']
    },
    'Coursera': { 
      type: 'paid', 
      baseRating: 4.6,
      priceRange: '$40-80/month',
      features: ['University certificates', 'Guided projects', 'Graded assignments']
    },
    'freeCodeCamp': { 
      type: 'free', 
      baseRating: 4.7,
      priceRange: 'Free',
      features: ['Interactive tutorials', 'Project-based learning', 'Certification']
    },
    'edX': { 
      type: 'paid', 
      baseRating: 4.5,
      priceRange: '$50-300',
      features: ['University credit', 'Verified certificates', 'Self-paced']
    },
    'YouTube': { 
      type: 'free', 
      baseRating: 4.4,
      priceRange: 'Free',
      features: ['Video tutorials', 'Community support', 'Real-time updates']
    },
    'Pluralsight': {
      type: 'paid',
      baseRating: 4.6,
      priceRange: '$30/month',
      features: ['Skill assessments', 'Learning paths', 'Exercise files']
    },
    'LinkedIn Learning': {
      type: 'paid',
      baseRating: 4.5,
      priceRange: '$40/month',
      features: ['Professional certificates', 'Industry experts', 'Mobile learning']
    }
  };

  const generateCourse = (skill, provider, providerData) => {
    const duration = Math.floor(Math.random() * 20 + 10); // 10-30 hours
    const rating = (providerData.baseRating + Math.random() * 0.4).toFixed(1);
    const students = Math.floor(Math.random() * 90000 + 10000); // 10k-100k students
    
    // Generate a more specific title based on skill type
    const titles = {
      default: `Complete ${skill} Developer Course`,
      framework: `${skill} Framework Masterclass`,
      language: `${skill} Programming from Zero to Hero`,
      tool: `${skill} Professional Certification Course`,
      cloud: `${skill} Cloud Solutions Architect Course`,
      ai: `${skill} for Artificial Intelligence and Machine Learning`
    };

    // Map skills to categories
    const category = 
      ['react', 'angular', 'vue'].includes(skill.toLowerCase()) ? 'framework' :
      ['javascript', 'python', 'java'].includes(skill.toLowerCase()) ? 'language' :
      ['aws', 'azure', 'gcp'].includes(skill.toLowerCase()) ? 'cloud' :
      ['machine learning', 'deep learning', 'ai'].includes(skill.toLowerCase()) ? 'ai' :
      ['docker', 'kubernetes', 'jenkins'].includes(skill.toLowerCase()) ? 'tool' :
      'default';
    
    return {
      title: titles[category],
      platform: provider,
      type: providerData.type,
      duration: `${duration} hours`,
      rating: parseFloat(rating),
      studentsEnrolled: students,
      priceRange: providerData.priceRange,
      features: providerData.features,
      updatedDate: new Date().toISOString().split('T')[0], // Current date
      difficulty: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
      link: `https://www.${provider.toLowerCase()}.com/learn/${skill.toLowerCase()}`
    };
  };

  // Generate 2-3 courses per skill
  const courses = skills.flatMap(skill => {
    const providers = Object.entries(courseProviders)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 2);
    
    return providers.map(([provider, data]) => 
      generateCourse(skill, provider, data)
    );
  });

  return courses;
};

export default fetchResources;
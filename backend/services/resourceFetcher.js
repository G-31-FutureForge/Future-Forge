const fetchResources = async (skills) => {
  // Mock course data with realistic information
  const courseProviders = {
    'Udemy': { type: 'paid', baseRating: 4.5 },
    'Coursera': { type: 'paid', baseRating: 4.6 },
    'freeCodeCamp': { type: 'free', baseRating: 4.7 },
    'edX': { type: 'paid', baseRating: 4.5 },
    'YouTube': { type: 'free', baseRating: 4.4 }
  };

  const generateCourse = (skill, provider, providerData) => {
    const duration = Math.floor(Math.random() * 20 + 10); // 10-30 hours
    const rating = (providerData.baseRating + Math.random() * 0.4).toFixed(1);
    
    return {
      title: `Complete ${skill} Developer Course`,
      platform: provider,
      type: providerData.type,
      duration: `${duration} hours`,
      rating: parseFloat(rating),
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
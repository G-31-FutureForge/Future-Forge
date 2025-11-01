const loadingScreen = (req, res, next) => {
  console.log('🔄 Analyzing your profile… Matching skills with job requirements…');
  next();
};

export default loadingScreen;
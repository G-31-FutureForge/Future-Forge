const matchSkills = (resumeSkills, jobSkills) => {
  const matched = resumeSkills.filter(skill => jobSkills.includes(skill));
  const missing = jobSkills.filter(skill => !resumeSkills.includes(skill));
  const extra = resumeSkills.filter(skill => !jobSkills.includes(skill));
  return { matched, missing, extra };
};

export default matchSkills;
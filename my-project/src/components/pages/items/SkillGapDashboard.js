import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SkillGapDashboard.css';
import YouTubeModal from '../../common/YouTubeModal';

const SkillGapDashboard = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState(null);
  const [refreshingCourses, setRefreshingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState(null);

  useEffect(() => {
    const storedAnalysis = localStorage.getItem('skillAnalysis');
    if (storedAnalysis) {
      setAnalysisData(JSON.parse(storedAnalysis));
    } else {
      navigate('/skill-gap-analyzer');
    }
  }, [navigate]);

  // Fetch fresh courses for missing skills from all platforms
  const handleRefreshCourses = async () => {
    if (!analysisData || !analysisData.missingSkills || analysisData.missingSkills.length === 0) {
      setCoursesError('No missing skills to fetch courses for');
      return;
    }

    setRefreshingCourses(true);
    setCoursesError(null);

    try {
      // Fetch courses from all providers for each missing skill
      const allCourses = [];
      const skills = analysisData.missingSkills.slice(0, 10); // Limit to first 10 skills

      // Import the course API utility
      const { fetchAndNormalizeCourses, COURSE_PROVIDERS } = await import('../../../utils/courseApi');

      for (const skill of skills) {
        try {
          // Fetch from all scraped platforms for better diversity
          const courses = await fetchAndNormalizeCourses(skill, COURSE_PROVIDERS.SCRAPED, 3);
          
          if (courses && courses.length > 0) {
            // Map courses to match the expected format
            const mappedCourses = courses.map((course, idx) => ({
              id: `refresh-${skill}-${idx}`,
              title: course.title || 'Untitled Course',
              platform: course.platform || 'Unknown',
              type: course.type || 'free',
              duration: course.duration || 'N/A',
              rating: course.rating || 4.5,
              studentsEnrolled: course.students || null,
              link: course.link || '#',
              description: course.description || '',
              channelTitle: course.instructor || course.platform || 'Unknown',
              thumbnail: course.thumbnail || null,
              isYouTube: course.isYouTube || false
            }));
            allCourses.push(...mappedCourses);
          }
        } catch (error) {
          console.error(`Error fetching courses for skill "${skill}":`, error);
        }
      }

      // Deduplicate courses by link
      const seen = new Set();
      const uniqueCourses = allCourses.filter((course) => {
        const key = (course.link || course.title || '').toLowerCase();
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });

      // Update analysis data with fresh courses
      const updatedAnalysis = {
        ...analysisData,
        recommendedCourses: uniqueCourses.slice(0, 15).map((course, index) => ({
          id: index + 1,
          ...course
        }))
      };

      setAnalysisData(updatedAnalysis);
      localStorage.setItem('skillAnalysis', JSON.stringify(updatedAnalysis));
    } catch (error) {
      console.error('Error refreshing courses:', error);
      setCoursesError('Failed to refresh courses. Please try again or check your connection.');
    } finally {
      setRefreshingCourses(false);
    }
  };

  const handleStartLearning = () => {
    navigate('/upskill-courses');
  };

  const handleNewAnalysis = () => {
    localStorage.removeItem('skillAnalysis');
    navigate('/skill-gap-analyzer');
  };

  if (!analysisData) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="skill-gap-dashboard">
      <div className="dashboard-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Skill Gap Analysis Dashboard</h1>
        <div className="job-fit-score">
          <div className="score-circle">
            <span className="score">{analysisData.jobFitScore}%</span>
            <span className="score-label">Job Fit Score</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="skills-section">
          <div className="skills-category">
            <h3>✅ Matched Skills</h3>
            <div className="skills-list">
              {analysisData.matchedSkills.map((skill, index) => (
                <span key={index} className="skill-tag matched">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="skills-category">
            <h3>❌ Missing Skills</h3>
            <div className="skills-list">
              {analysisData.missingSkills.map((skill, index) => (
                <span key={index} className="skill-tag missing">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="skills-category">
            <h3>💫 Extra Skills</h3>
            <div className="skills-list">
              {analysisData.extraSkills.map((skill, index) => (
                <span key={index} className="skill-tag extra">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="courses-section">
          <div className="section-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <h2>🎓 Recommended Courses</h2>
                <p>Bridge your skill gaps with these curated YouTube courses</p>
              </div>
              {analysisData.missingSkills && analysisData.missingSkills.length > 0 && (
                <button 
                  className="btn-secondary" 
                  onClick={handleRefreshCourses}
                  disabled={refreshingCourses}
                  style={{ marginLeft: '20px' }}
                >
                  {refreshingCourses ? '🔄 Refreshing...' : '🔄 Refresh Courses'}
                </button>
              )}
            </div>
          </div>

          {coursesError && (
            <div className="error-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fee', color: '#c33', borderRadius: '5px' }}>
              {coursesError}
            </div>
          )}

          {refreshingCourses && (
            <div className="loading-message" style={{ marginBottom: '20px', padding: '10px', textAlign: 'center' }}>
              🔄 Fetching fresh courses from multiple platforms...
            </div>
          )}

          {analysisData.recommendedCourses && analysisData.recommendedCourses.length > 0 ? (
            <div className="courses-grid">
              {analysisData.recommendedCourses.map((course, index) => (
                <div key={course.id || index} className="course-card">
                  <div className="course-header">
                    <h4>{course.title}</h4>
                    <span className={`course-type ${course.type || 'free'}`}>
                      {course.type === 'free' ? '🆓 Free' : '💳 Paid'}
                    </span>
                  </div>
                  <div className="course-info">
                    <span className="platform">
                      🎥 {course.channelTitle || course.platform || 'Unknown Platform'}
                    </span>
                    <span className="duration">⏱️ {course.duration || 'Video Course'}</span>
                    {course.rating && (
                      <span className="rating">
                        ⭐ {typeof course.rating === 'number' ? course.rating.toFixed(1) : course.rating}/5
                      </span>
                    )}
                    {course.studentsEnrolled && (
                      <span className="students">👁️ {course.studentsEnrolled}</span>
                    )}
                  </div>
                  {course.thumbnail && (
                    <div className="course-thumbnail" style={{ marginTop: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        style={{ width: '100%', height: 'auto', maxHeight: '150px', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <button 
                    className="course-btn"
                    onClick={() => {
                      const link = (course.link || '').toString();
                      if (course.isYouTube) setVideoUrl(link);
                      else window.open(link, '_blank');
                    }}
                  >
                    View Course
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-courses-message">
              <p>No course recommendations available at the moment.</p>
              <p className="hint">
                {analysisData.missingSkills && analysisData.missingSkills.length > 0 
                  ? 'Click "Refresh Courses" to fetch courses from multiple e-learning platforms for your missing skills.'
                  : 'Re-run the skill analysis to get course recommendations.'}
              </p>
              {analysisData.missingSkills && analysisData.missingSkills.length > 0 ? (
                <button className="btn-secondary" onClick={handleRefreshCourses} disabled={refreshingCourses}>
                  {refreshingCourses ? '🔄 Refreshing...' : '🔄 Refresh Courses from All Platforms'}
                </button>
              ) : (
                <button className="btn-secondary" onClick={handleNewAnalysis}>
                  Re-analyze Skills
                </button>
              )}
            </div>
          )}

          <div className="action-buttons">
            <button className="btn-primary" onClick={handleStartLearning}>
              Start Learning Journey
            </button>
            <button className="btn-secondary" onClick={handleNewAnalysis}>
              Analyze Another Job
            </button>
          </div>
        </div>
      </div>
      {videoUrl && (
        <YouTubeModal url={videoUrl} onClose={() => setVideoUrl(null)} />
      )}
    </div>
  );
};

export default SkillGapDashboard;
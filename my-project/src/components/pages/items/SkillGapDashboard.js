import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SkillGapDashboard.css';
import YouTubeModal from '../../common/YouTubeModal';

const SkillGapDashboard = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    const storedAnalysis = localStorage.getItem('skillAnalysis');
    if (storedAnalysis) {
      setAnalysisData(JSON.parse(storedAnalysis));
    } else {
      navigate('/skill-gap-analyzer');
    }
  }, [navigate]);

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
            <h2>🎓 Recommended Courses</h2>
            <p>Bridge your skill gaps with these curated courses</p>
          </div>

          <div className="courses-grid">
            {analysisData.recommendedCourses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <h4>{course.title}</h4>
                  <span className={`course-type ${course.type}`}>
                    {course.type === 'free' ? '🆓 Free' : '💳 Paid'}
                  </span>
                </div>
                <div className="course-info">
                  <span className="platform">🏢 {course.platform}</span>
                  <span className="duration">⏱️ {course.duration}</span>
                  <span className="rating">⭐ {course.rating}/5</span>
                </div>
                <button 
                  className="course-btn"
                  onClick={() => {
                    const link = (course.link || '').toString();
                    const isYouTube = (course.platform && course.platform.toString().toLowerCase().includes('youtube'))
                      || link.includes('youtube.com')
                      || link.includes('youtu.be');
                    if (isYouTube) setVideoUrl(link);
                    else window.open(link, '_blank');
                  }}
                >
                  View Course
                </button>
              </div>
            ))}
          </div>

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
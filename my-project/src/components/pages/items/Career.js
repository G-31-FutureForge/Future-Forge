import React, { useState, useEffect } from 'react';
import './Career.css';

const Career = () => {
  const [educationLevel, setEducationLevel] = useState('after12th');
  const [coursesData, setCoursesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);

  const educationLevels = [
    { value: 'after10th', label: '10th Grade', description: 'Diploma, ITI, Vocational & Certification Courses' },
    { value: 'after12th', label: '12th Grade', description: 'Degrees, Professional & Government Exam Paths' },
    { value: 'graduation', label: 'Graduation', description: 'Post-Graduate, Certifications & Career Options' }
  ];

  // Fetch courses when education level changes
  useEffect(() => {
    fetchCourses(educationLevel);
  }, [educationLevel]);

  const fetchCourses = async (level) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/courses/by-education/${level}`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      const result = await response.json();
      setCoursesData(result.data);
      setSelectedStream(null); // Reset stream filter
    } catch (err) {
      setError(err.message);
      setCoursesData(null);
    } finally {
      setLoading(false);
    }
  };

  // Get current education level info
  const currentLevel = educationLevels.find(l => l.value === educationLevel);

  return (
    <div className="career-container">
      <div className="career-header">
        <h1>🎓 Career Guidance System</h1>
        <p>Discover India-specific courses and career paths based on your education level</p>
      </div>

      {/* Education Level Selector */}
      <div className="education-selector">
        <label htmlFor="education-level">Select Your Education Level:</label>
        <select
          id="education-level"
          value={educationLevel}
          onChange={(e) => setEducationLevel(e.target.value)}
          className="select-input"
        >
          {educationLevels.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        {currentLevel && (
          <p className="level-description">{currentLevel.description}</p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading courses...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Content */}
      {coursesData && !loading && (
        <div className="career-content">
          {/* Info Section */}
          <div className="info-section">
            <p className="total-courses">Total Courses Available: <strong>{coursesData.totalCourses}</strong></p>
            
            {/* Stream Filter */}
            {coursesData.streams && coursesData.streams.length > 0 && (
              <div className="stream-filter">
                <label>Filter by Stream:</label>
                <div className="stream-buttons">
                  <button
                    className={`stream-btn ${!selectedStream ? 'active' : ''}`}
                    onClick={() => setSelectedStream(null)}
                  >
                    All Streams
                  </button>
                  {coursesData.streams.map(stream => (
                    <button
                      key={stream}
                      className={`stream-btn ${selectedStream === stream ? 'active' : ''}`}
                      onClick={() => setSelectedStream(stream)}
                    >
                      {stream}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Courses Grouped by Type */}
          {coursesData.coursesByType && Object.keys(coursesData.coursesByType).length > 0 ? (
            <div className="course-sections">
              {Object.entries(coursesData.coursesByType).map(([courseType, courses]) => {
                // Filter courses by selected stream
                const filteredCourses = selectedStream
                  ? courses.filter(course => course.stream === selectedStream)
                  : courses;

                if (filteredCourses.length === 0) return null;

                return (
                  <div key={courseType} className="course-section">
                    <div className="section-header">
                      <h2 className="section-title">📌 {courseType}</h2>
                      <span className="course-count">{filteredCourses.length} courses</span>
                    </div>

                    <div className="courses-grid">
                      {filteredCourses.map((course, index) => (
                        <div key={index} className="course-card">
                          {/* Course Header */}
                          <div className="course-header-card">
                            <h3 className="course-name">{course.courseName}</h3>
                            <div className="course-badges">
                              <span className="badge badge-duration">📚 {course.duration}</span>
                            </div>
                          </div>

                          {/* Course Meta */}
                          <div className="course-meta">
                            {course.stream && (
                              <p className="meta-item">
                                <strong>Stream:</strong> {course.stream}
                              </p>
                            )}
                            {course.salary && course.salary !== 'N/A' && (
                              <p className="meta-item">
                                <strong>Avg. Salary:</strong> {course.salary}
                              </p>
                            )}
                            {course.demand && (
                              <p className="meta-item">
                                <strong>Demand:</strong> 
                                <span className={`demand-badge demand-${course.demand.toLowerCase().replace(/\s+/g, '-')}`}>
                                  {course.demand}
                                </span>
                              </p>
                            )}
                          </div>

                          {/* Career Paths */}
                          <div className="career-paths">
                            <h4>💼 Career Paths:</h4>
                            <ul className="career-list">
                              {course.careerPaths && course.careerPaths.length > 0 ? (
                                course.careerPaths.map((path, idx) => (
                                  <li key={idx} className="career-item">
                                    {path}
                                  </li>
                                ))
                              ) : (
                                <li className="career-item">Career information pending</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-courses">
              <p>No courses found for the selected filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Career;

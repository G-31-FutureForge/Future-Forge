import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SkillGapDashboard.css';
import YouTubeModal from '../../common/YouTubeModal';

const SkillGapDashboard = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState(null);
  const [isFetchingCourses, setIsFetchingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const calculateStats = (data) => {
      return {
        totalSkills: data.matchedSkills.length + data.missingSkills.length + data.extraSkills.length,
        matchPercentage: Math.round((data.matchedSkills.length / data.missingSkills.length) * 100) || 0,
        learningPath: data.missingSkills.length * 15
      };
    };

    // Enhanced course fetching with fallbacks
    const fetchCoursesForMissingSkills = async (missingSkills) => {
      if (!missingSkills || missingSkills.length === 0) {
        setIsFetchingCourses(false);
        return [];
      }

      try {
        const { fetchAndNormalizeCourses, COURSE_PROVIDERS } = await import('../../../utils/courseApi');
        const allCourses = [];
        
        // First, try to fetch courses for exact skills
        const skills = missingSkills.slice(0, 5);

        // BROADER SEARCH QUERIES for common programming topics
        const searchQueries = {
          'spring': ['spring framework', 'spring boot', 'java spring', 'spring mvc'],
          'hibernate': ['hibernate orm', 'java hibernate', 'jpa hibernate', 'database java'],
          'java': ['java programming', 'core java', 'advanced java', 'java development'],
          'python': ['python programming', 'python development', 'python data science'],
          'react': ['react js', 'react development', 'frontend react'],
          'angular': ['angular framework', 'angular development'],
          'node': ['node js', 'node development', 'backend node'],
          'sql': ['sql database', 'mysql', 'postgresql', 'database management']
        };

        for (const skill of skills) {
          // Get alternative search terms for the skill
          const searchTerms = searchQueries[skill.toLowerCase()] || [skill];
          
          // Try each search term
          for (const searchTerm of searchTerms.slice(0, 2)) {
            try {
              const courses = await fetchAndNormalizeCourses(searchTerm, COURSE_PROVIDERS.SCRAPED, 3);
              
              if (courses && courses.length > 0) {
                const mappedCourses = courses.map((course, idx) => ({
                  id: `${skill}-${searchTerm}-${idx}-${Date.now()}`,
                  title: course.title || `Learn ${skill}`,
                  platform: course.platform || 'Online Platform',
                  type: course.type || 'free',
                  duration: course.duration || 'Self-paced',
                  rating: typeof course.rating === 'number' ? course.rating : 4.0,
                  studentsEnrolled: course.students || null,
                  link: course.link || '#',
                  description: course.description || `Learn ${skill} and related technologies with this course`,
                  channelTitle: course.instructor || course.platform || 'Expert Instructor',
                  thumbnail: course.thumbnail || null,
                  isYouTube: course.isYouTube || false,
                  skill: skill,
                  searchTerm: searchTerm,
                  relevance: 5 // High relevance since it's for a missing skill
                }));
                
                allCourses.push(...mappedCourses);
                break; // Found courses for this search term, move to next skill
              }
            } catch (error) {
              console.warn(`Failed to fetch courses for "${searchTerm}":`, error);
              continue;
            }
          }
        }

        // If we still don't have enough courses, fetch generic programming courses
        if (allCourses.length < 6) {
          console.log('Fetching generic programming courses as fallback...');
          try {
            const genericCourses = await fetchAndNormalizeCourses('programming', COURSE_PROVIDERS.SCRAPED, 6);
            
            if (genericCourses && genericCourses.length > 0) {
              const mappedGenericCourses = genericCourses.map((course, idx) => ({
                id: `generic-${idx}-${Date.now()}`,
                title: course.title || 'Programming Course',
                platform: course.platform || 'Online Platform',
                type: course.type || 'free',
                duration: course.duration || 'Self-paced',
                rating: typeof course.rating === 'number' ? course.rating : 4.0,
                studentsEnrolled: course.students || null,
                link: course.link || '#',
                description: course.description || 'General programming course to enhance your skills',
                channelTitle: course.instructor || course.platform || 'Expert Instructor',
                thumbnail: course.thumbnail || null,
                isYouTube: course.isYouTube || false,
                skill: 'programming',
                searchTerm: 'programming',
                relevance: 3 // Medium relevance since it's generic
              }));
              
              allCourses.push(...mappedGenericCourses);
            }
          } catch (error) {
            console.warn('Failed to fetch generic courses:', error);
          }
        }

        // If STILL no courses, create fallback placeholder courses
        if (allCourses.length === 0) {
          console.log('Creating fallback placeholder courses...');
          const fallbackCourses = [
            {
              id: 'fallback-1',
              title: 'Spring Framework Masterclass',
              platform: 'Udemy',
              type: 'paid',
              duration: '24 hours',
              rating: 4.6,
              link: 'https://www.udemy.com/course/spring-framework-5-beginner-to-guru/',
              description: 'Learn Spring Framework, Spring Boot, Spring MVC, Spring Data JPA, and more',
              channelTitle: 'John Thompson',
              skill: 'spring',
              relevance: 5
            },
            {
              id: 'fallback-2',
              title: 'Hibernate & JPA Tutorial - Master Class',
              platform: 'Udemy',
              type: 'paid',
              duration: '18 hours',
              rating: 4.5,
              link: 'https://www.udemy.com/course/hibernate-jpa-tutorial-for-beginners-in-100-steps/',
              description: 'Learn Hibernate ORM with JPA using Spring Boot and MySQL',
              channelTitle: 'Ranga Karanam',
              skill: 'hibernate',
              relevance: 5
            },
            {
              id: 'fallback-3',
              title: 'Java Programming Masterclass',
              platform: 'Udemy',
              type: 'paid',
              duration: '80 hours',
              rating: 4.6,
              link: 'https://www.udemy.com/course/java-the-complete-java-developer-course/',
              description: 'Become a Java developer with this comprehensive course',
              channelTitle: 'Tim Buchalka',
              skill: 'java',
              relevance: 5
            },
            {
              id: 'fallback-4',
              title: 'Full Stack Java Development',
              platform: 'Coursera',
              type: 'free',
              duration: '12 weeks',
              rating: 4.4,
              link: 'https://www.coursera.org/specializations/full-stack-java-development',
              description: 'Learn full-stack Java development with Spring Boot and React',
              channelTitle: 'IBM',
              skill: 'java',
              relevance: 4
            }
          ];
          
          // Filter to match missing skills
          const relevantFallbackCourses = fallbackCourses.filter(course => 
            missingSkills.some(skill => 
              skill.toLowerCase().includes(course.skill.toLowerCase()) || 
              course.title.toLowerCase().includes(skill.toLowerCase())
            )
          );
          
          allCourses.push(...relevantFallbackCourses);
        }

        // Remove duplicates
        const seen = new Set();
        const uniqueCourses = [];
        
        allCourses.forEach(course => {
          const key = `${course.title}-${course.platform}`.toLowerCase();
          if (!seen.has(key) && course.link && course.link !== '#') {
            seen.add(key);
            uniqueCourses.push(course);
          }
        });

        // Sort by relevance and rating
        uniqueCourses.sort((a, b) => {
          if (b.relevance !== a.relevance) {
            return b.relevance - a.relevance;
          }
          return (b.rating || 0) - (a.rating || 0);
        });

        return uniqueCourses.slice(0, 9);
      } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
      }
    };

    const initializeDashboard = async () => {
      const storedAnalysis = localStorage.getItem('skillAnalysis');
      
      if (storedAnalysis) {
        const parsedAnalysis = JSON.parse(storedAnalysis);
        
        // Calculate stats
        setStats(calculateStats(parsedAnalysis));
        setAnalysisData(parsedAnalysis); // Set analysis data immediately
        
        // Check if we need to fetch courses
        const shouldFetchCourses = 
          (!parsedAnalysis.recommendedCourses || parsedAnalysis.recommendedCourses.length === 0) &&
          parsedAnalysis.missingSkills && 
          parsedAnalysis.missingSkills.length > 0;
        
        if (shouldFetchCourses) {
          // Fetch courses automatically for missing skills
          setIsFetchingCourses(true);
          setCoursesError(null);
          
          try {
            const courses = await fetchCoursesForMissingSkills(parsedAnalysis.missingSkills);
            
            const updatedAnalysis = {
              ...parsedAnalysis,
              recommendedCourses: courses.map((course, index) => ({
                id: index + 1,
                ...course
              }))
            };
            
            setAnalysisData(updatedAnalysis);
            localStorage.setItem('skillAnalysis', JSON.stringify(updatedAnalysis));
          } catch (error) {
            console.error('Failed to load courses:', error);
            setCoursesError('Course recommendations temporarily unavailable. You can still view your skill analysis.');
          } finally {
            setIsFetchingCourses(false);
          }
        } else {
          setIsFetchingCourses(false);
        }
      } else {
        navigate('/skill-gap-analyzer');
      }
    };

    initializeDashboard();
  }, [navigate]);

  const handleRefreshCourses = async () => {
    if (!analysisData || !analysisData.missingSkills || analysisData.missingSkills.length === 0) {
      setCoursesError('No missing skills to fetch courses for');
      return;
    }

    setIsFetchingCourses(true);
    setCoursesError(null);

    try {
      const { fetchAndNormalizeCourses, COURSE_PROVIDERS } = await import('../../../utils/courseApi');
      const allCourses = [];
      const skills = analysisData.missingSkills.slice(0, 5);

      // BROADER SEARCH QUERIES - more comprehensive
      const searchQueries = {
        'spring': ['spring boot tutorial', 'spring framework course', 'learn spring', 'java spring boot'],
        'hibernate': ['hibernate tutorial', 'jpa course', 'orm hibernate', 'java database'],
        'java': ['java course', 'learn java', 'java programming tutorial', 'advanced java'],
        'python': ['python tutorial', 'python course', 'learn python'],
        'react': ['react tutorial', 'react course', 'learn react'],
        'angular': ['angular tutorial', 'angular course'],
        'sql': ['sql tutorial', 'database course', 'learn sql']
      };

      for (const skill of skills) {
        const searchTerms = searchQueries[skill.toLowerCase()] || [skill];
        
        // Try different providers
        const providers = [
          COURSE_PROVIDERS.SCRAPED,
          COURSE_PROVIDERS.FREECODECAMP,
          COURSE_PROVIDERS.CODECADEMY
        ];

        for (const provider of providers) {
          for (const searchTerm of searchTerms.slice(0, 2)) {
            try {
              const courses = await fetchAndNormalizeCourses(searchTerm, provider, 2);
              
              if (courses && courses.length > 0) {
                const mappedCourses = courses.map((course, idx) => ({
                  id: `${skill}-${provider}-refresh-${idx}-${Date.now()}`,
                  title: course.title || `Learn ${skill}`,
                  platform: course.platform || provider,
                  type: course.type || 'free',
                  duration: course.duration || 'Self-paced',
                  rating: typeof course.rating === 'number' ? course.rating : 4.0,
                  link: course.link || '#',
                  description: course.description || `Course for ${skill} development`,
                  channelTitle: course.instructor || course.platform || 'Instructor',
                  thumbnail: course.thumbnail || null,
                  isYouTube: course.isYouTube || false,
                  skill: skill
                }));
                
                allCourses.push(...mappedCourses);
                break; // Found courses, move to next skill
              }
            } catch (error) {
              console.warn(`Failed to fetch from ${provider} for "${searchTerm}":`, error);
              continue;
            }
          }
          if (allCourses.length > 0) break; // Found courses, move to next skill
        }
      }

      // Remove duplicates
      const seen = new Set();
      const uniqueCourses = allCourses.filter((course) => {
        const key = (course.link || course.title).toLowerCase();
        if (seen.has(key) || !course.link || course.link === '#') return false;
        seen.add(key);
        return true;
      });

      // Sort by rating
      uniqueCourses.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      const updatedAnalysis = {
        ...analysisData,
        recommendedCourses: uniqueCourses.slice(0, 9).map((course, index) => ({
          id: index + 1,
          ...course
        }))
      };

      setAnalysisData(updatedAnalysis);
      localStorage.setItem('skillAnalysis', JSON.stringify(updatedAnalysis));
    } catch (error) {
      console.error('Error refreshing courses:', error);
      setCoursesError('Unable to refresh courses. Please check your internet connection.');
    } finally {
      setIsFetchingCourses(false);
    }
  };

  const handleStartLearning = () => {
    navigate('/upskill-courses');
  };

  const handleNewAnalysis = () => {
    localStorage.removeItem('skillAnalysis');
    navigate('/skill-gap-analyzer');
  };

  if (!analysisData || !stats) {
    return (
      <div className="skill-gap-dashboard loading">
        <div className="dashboard-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-content">
            <div className="skeleton-stats"></div>
            <div className="skeleton-skills"></div>
            <div className="skeleton-courses"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="skill-gap-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <span className="btn-icon">←</span>
            <span className="btn-text">Dashboard</span>
          </button>
          <div className="header-title">
            <h1>Skill Gap Analysis</h1>
            <p className="subtitle"></p>
          </div>
          <div className="job-fit-score">
            <div className="score-display">
              <div className="score-circle">
                <div className="score-value">{analysisData.jobFitScore}%</div>
                <div className="score-label">Job Fit</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon total-skills">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalSkills}</div>
            <div className="stat-label">Total Skills Analyzed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon matched">✓</div>
          <div className="stat-content">
            <div className="stat-value">{analysisData.matchedSkills.length}</div>
            <div className="stat-label">Matched Skills</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon missing">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{analysisData.missingSkills.length}</div>
            <div className="stat-label">Missing Skills</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon learning">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.learningPath}</div>
            <div className="stat-label">Est. Learning Hours</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Left Column - Skills Analysis */}
        <div className="left-column">
          <div className="skills-analysis-section">
            <div className="section-header">
              <h2>Skills Analysis</h2>
              <div className="section-actions">
                <span className="skill-summary">
                  {analysisData.matchedSkills.length} matched • {analysisData.missingSkills.length} to learn
                </span>
              </div>
            </div>
            
            <div className="skills-cards">
              <div className="skill-category-card matched">
                <div className="category-header">
                  <div className="category-icon">✓</div>
                  <div className="category-title">
                    <h3>Matched Skills</h3>
                    <p className="category-subtitle">You already have these required skills</p>
                  </div>
                  <span className="category-count">{analysisData.matchedSkills.length}</span>
                </div>
                <div className="skills-grid">
                  {analysisData.matchedSkills.map((skill, index) => (
                    <div key={index} className="skill-item">
                      <div className="skill-indicator matched"></div>
                      <span className="skill-text">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="skill-category-card missing">
                <div className="category-header">
                  <div className="category-icon">⚠️</div>
                  <div className="category-title">
                    <h3>Missing Skills</h3>
                    <p className="category-subtitle">Required skills you need to develop</p>
                  </div>
                  <span className="category-count">{analysisData.missingSkills.length}</span>
                </div>
                <div className="skills-grid">
                  {analysisData.missingSkills.map((skill, index) => (
                    <div key={index} className="skill-item">
                      <div className="skill-indicator missing"></div>
                      <span className="skill-text">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="skill-category-card extra">
                <div className="category-header">
                  <div className="category-icon">+</div>
                  <div className="category-title">
                    <h3>Extra Skills</h3>
                    <p className="category-subtitle">Your skills beyond job requirements</p>
                  </div>
                  <span className="category-count">{analysisData.extraSkills.length}</span>
                </div>
                <div className="skills-grid">
                  {analysisData.extraSkills.map((skill, index) => (
                    <div key={index} className="skill-item">
                      <div className="skill-indicator extra"></div>
                      <span className="skill-text">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Course Recommendations */}
        <div className="right-column">
          <div className="courses-section">
            <div className="section-header">
              <div className="header-content">
                <div className="title-group">
                  <h2>Course Recommendations</h2>
                  <p className="section-subtitle">
                    {isFetchingCourses 
                      ? 'Fetching personalized course recommendations...' 
                      : `Found ${analysisData.recommendedCourses?.length || 0} courses for your missing skills`
                    }
                  </p>
                </div>
                <div className="header-actions">
                  {!isFetchingCourses && analysisData.missingSkills.length > 0 && (
                    <button 
                      className="btn-refresh"
                      onClick={handleRefreshCourses}
                      disabled={isFetchingCourses}
                    >
                      <span className="btn-icon">🔄</span>
                      <span className="btn-text">Refresh</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {coursesError && (
              <div className="status-message error">
                <div className="message-icon">⚠️</div>
                <div className="message-content">
                  <p>{coursesError}</p>
                </div>
              </div>
            )}

            {isFetchingCourses ? (
              <div className="courses-loading">
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <div className="loading-text">
                    Searching for courses on: Spring, Hibernate, Java...
                  </div>
                </div>
              </div>
            ) : analysisData.recommendedCourses && analysisData.recommendedCourses.length > 0 ? (
              <div className="courses-grid">
                {analysisData.recommendedCourses.map((course, index) => (
                  <div key={course.id || index} className="course-card">
                    <div className="course-badge">{course.type === 'free' ? 'FREE' : 'PREMIUM'}</div>
                    <div className="course-content">
                      <div className="course-header">
                        <div className="platform-badge">
                          {course.platform === 'FreeCodeCamp' ? '🆓' : 
                           course.platform === 'Codecademy' ? '💻' : 
                           course.platform === 'Khan Academy' ? '🎓' : '📚'}
                        </div>
                        <h4 className="course-title">{course.title}</h4>
                      </div>
                      
                      <div className="course-meta">
                        <div className="meta-item">
                          <span className="meta-icon">🎯</span>
                          <span className="meta-text">{course.skill || 'Programming'}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-icon">⏱️</span>
                          <span className="meta-text">{course.duration || 'Self-paced'}</span>
                        </div>
                        {course.rating && (
                          <div className="meta-item">
                            <span className="meta-icon">⭐</span>
                            <span className="meta-text">{typeof course.rating === 'number' ? course.rating.toFixed(1) : course.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="course-description">
                        <p>{course.description?.substring(0, 120)}...</p>
                      </div>
                      
                      <div className="course-actions">
                        <button 
                          className="btn-enroll"
                          onClick={() => {
                            const link = (course.link || '').toString();
                            if (course.isYouTube) {
                              setVideoUrl(link);
                            } else {
                              window.open(link, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          {course.isYouTube ? 'Watch Course' : 'View Course'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No Courses Found</h3>
                <p>We couldn't find courses for your specific skills. Try refreshing or explore our course library.</p>
                <div className="empty-actions">
                  <button className="btn-primary" onClick={handleRefreshCourses}>
                    Try Fetching Again
                  </button>
                  <button className="btn-secondary" onClick={handleStartLearning}>
                    Browse All Courses
                  </button>
                </div>
              </div>
            )}

            <div className="section-footer">
              <div className="action-buttons">
                <button className="btn-primary large" onClick={handleStartLearning}>
                  <span className="btn-icon">🚀</span>
                  <span className="btn-text">Explore All Courses</span>
                </button>
                <button className="btn-secondary" onClick={handleNewAnalysis}>
                  <span className="btn-icon">🔍</span>
                  <span className="btn-text">Analyze Another Job</span>
                </button>
              </div>
              <div className="footer-note">
                <p>Courses are automatically fetched from multiple e-learning platforms. If no courses appear, try refreshing or the platform might be temporarily unavailable.</p>
              </div>
            </div>
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
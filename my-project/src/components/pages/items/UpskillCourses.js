import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UpskillCourses.css';
import YouTubeModal from '../../common/YouTubeModal';
import { 
  fetchAndNormalizeCourses, 
  COURSE_PROVIDERS, 
  PROVIDER_INFO,
  getProviderIcon,
  getProviderName 
} from '../../../utils/courseApi';

const UpskillCourses = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState(COURSE_PROVIDERS.ALL);
  const navigate = useNavigate();

  // Categories for course filtering
  const categories = [
    { id: 'all', name: 'All Courses', icon: '🌐' },
    { id: 'web', name: 'Web Development', icon: '💻' },
    { id: 'data', name: 'Data Science', icon: '📊' },
    { id: 'cloud', name: 'Cloud Computing', icon: '☁️' },
    { id: 'mobile', name: 'Mobile Development', icon: '📱' },
    { id: 'ai', name: 'AI & ML', icon: '🧠' }
  ];

  // Popular providers to show in selector
  const popularProviders = [
    COURSE_PROVIDERS.ALL,
    COURSE_PROVIDERS.YOUTUBE,
    // Udemy and edX removed
    COURSE_PROVIDERS.KHAN_ACADEMY,
    COURSE_PROVIDERS.FREECODECAMP,
    COURSE_PROVIDERS.CODECADEMY,
    COURSE_PROVIDERS.SCRAPED
  ];

  // UI state for courses fetched from backend
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  const categoryQueryMap = {
    all: 'programming',
    web: 'web development',
    data: 'data science',
    cloud: 'cloud computing',
    mobile: 'mobile development',
    ai: 'machine learning'
  };

  const fetchCoursesFromBackend = async (query, provider) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[UpskillCourses] Fetching courses - query: "${query}", provider: "${provider}"`);
      const normalizedCourses = await fetchAndNormalizeCourses(query, provider, 15);
      console.log(`[UpskillCourses] Received ${normalizedCourses.length} courses`);
      
      if (normalizedCourses.length === 0) {
        console.warn(`[UpskillCourses] No courses received. Check backend logs for details.`);
        setError(`No courses found for "${query}" on ${provider}. The backend might be having issues fetching from providers. Check browser console and backend logs for details.`);
      }
      
      setCourses(normalizedCourses);
    } catch (err) {
      console.error('[UpskillCourses] fetchCourses error', err);
      setError(err.message || 'Failed to fetch courses. Please check if the backend server is running and check the browser console for details.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch when selectedCategory or selectedProvider changes
    const q = categoryQueryMap[selectedCategory] || 'programming';
    fetchCoursesFromBackend(q, selectedProvider);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedProvider]);

  return (
    <div className="upskill-courses">
      <div className="courses-header">
        <h1>🎓 Upskill Yourself</h1>
        <p>Discover courses from multiple platforms to enhance your skills and career prospects</p>
      </div>

      {/* Platform Selector */}
      <div className="platform-selector">
        <h3>Select Platform:</h3>
        <div className="platform-buttons">
          {popularProviders.map(provider => (
            <button
              key={provider}
              className={`platform-btn ${selectedProvider === provider ? 'active' : ''}`}
              onClick={() => setSelectedProvider(provider)}
              title={getProviderName(provider)}
            >
              <span className="platform-icon">{getProviderIcon(provider)}</span>
              <span className="platform-name">{getProviderName(provider)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="courses-container">
        <div className="categories-sidebar">
          <h3>Categories</h3>
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        <div className="courses-grid">
          {loading && <div className="loading">Loading courses…</div>}
          {error && (
            <div className="error">
              {error}
              <p className="error-hint">Try selecting a different platform or category.</p>
            </div>
          )}
          {!loading && !error && courses.length === 0 && (
            <div className="no-courses">
              <p>No courses available at the moment.</p>
              <p className="hint">Try selecting a different platform or search query.</p>
            </div>
          )}
          {courses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-badge">{course.level}</div>
              <div className="course-header">
                <h4>{course.title}</h4>
                <span className={`course-type ${course.type}`}>
                  {course.type === 'free' ? '🆓 Free' : '💳 Paid'}
                </span>
              </div>
              <div className="course-info">
                <span className="platform">🏢 {course.platform}</span>
                <span className="duration">⏱️ {course.duration}</span>
                {course.rating && <span className="rating">⭐ {typeof course.rating === 'number' ? course.rating.toFixed(1) : course.rating}/5</span>}
                {course.students && <span className="students">👥 {course.students}</span>}
                {course.instructor && <span className="instructor">👤 {course.instructor}</span>}
              </div>
              {course.description && (
                <div className="course-description">
                  <p>{course.description.substring(0, 100)}...</p>
                </div>
              )}
              <button 
                className="enroll-btn"
                onClick={() => {
                  const link = (course.link || '').toString();
                  if (course.isYouTube) {
                    setVideoUrl(link);
                  } else {
                    window.open(link, '_blank');
                  }
                }}
              >
                {course.isYouTube ? 'Watch Now' : 'Enroll Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
      {videoUrl && (
        <YouTubeModal url={videoUrl} onClose={() => setVideoUrl(null)} />
      )}
    </div>
  );
};

export default UpskillCourses;

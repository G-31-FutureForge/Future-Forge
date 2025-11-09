import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UpskillCourses.css';
import YouTubeModal from '../../common/YouTubeModal';

const UpskillCourses = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  const fetchCoursesFromBackend = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/courses?query=${encodeURIComponent(query)}&provider=youtube&limit=15`);
      if (!res.ok) throw new Error((await res.json()).message || res.statusText);
      const data = await res.json();
      // Map backend results to display-friendly objects
      const mapped = (data.courses || []).map((c, idx) => ({
        id: `remote-${idx}`,
        title: c.title || c.name || 'Untitled',
        platform: c.platform || c.channelTitle || 'YouTube',
        type: c.type || 'free', // YouTube courses are free
        level: c.difficulty || 'Intermediate',
        duration: c.duration || 'Video Course',
        rating: c.rating || c.avgRating || null,
        students: c.studentsEnrolled || (c.viewCount ? `${(c.viewCount / 1000).toFixed(1)}K views` : null),
        link: c.link || c.url || c.videoUrl || '#'
      }));

      setCourses(mapped);
    } catch (err) {
      console.error('fetchCourses error', err.message || err);
      setError(err.message || 'Failed to fetch courses. Please make sure the YouTube API key is configured.');
      setCourses([]); // Set empty array instead of fallback to dummy data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch when selectedCategory changes
    const q = categoryQueryMap[selectedCategory] || 'programming';
    fetchCoursesFromBackend(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  return (
    <div className="upskill-courses">
      <div className="courses-header">
        <h1>🎓 Upskill Yourself</h1>
        <p>Discover courses to enhance your skills and career prospects</p>
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
              <p className="error-hint">Make sure the YouTube API key is configured in the backend.</p>
            </div>
          )}
          {!loading && !error && courses.length === 0 && (
            <div className="no-courses">
              <p>No courses available at the moment.</p>
              <p className="hint">Please configure the YouTube API key to see course recommendations.</p>
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
              </div>
              <button 
                className="enroll-btn"
                onClick={() => {
                  const link = (course.link || '').toString();
                  const isYouTube = (course.platform && course.platform.toString().toLowerCase().includes('youtube'))
                    || link.includes('youtube.com')
                    || link.includes('youtu.be');
                  if (isYouTube) {
                    setVideoUrl(link);
                  } else {
                    window.open(link, '_blank');
                  }
                }}
              >
                Enroll Now
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

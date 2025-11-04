import React, { useState, useEffect } from 'react';
import VideoModal from '../../common/VideoModal';
import { useNavigate } from 'react-router-dom';
import './UpskillCourses.css';

const UpskillCourses = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  const coursesData = {
    all: [
      {
        id: 1,
        title: 'Complete Web Development Bootcamp',
        platform: 'Udemy',
        type: 'paid',
        level: 'Beginner',
        duration: '60 hours',
        rating: 4.7,
        students: '500K+',
        link: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/'
      },
      {
        id: 2,
        title: 'JavaScript Algorithms and Data Structures',
        platform: 'FreeCodeCamp',
        type: 'free',
        level: 'Intermediate',
        duration: '300 hours',
        rating: 4.8,
        students: '1M+',
        link: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/'
      },
      {
        id: 3,
        title: 'Machine Learning Specialization',
        platform: 'Coursera',
        type: 'paid',
        level: 'Intermediate',
        duration: '80 hours',
        rating: 4.9,
        students: '200K+',
        link: 'https://www.coursera.org/specializations/machine-learning-introduction'
      },
      {
        id: 4,
        title: 'AWS Cloud Technical Essentials',
        platform: 'Coursera',
        type: 'free',
        level: 'Beginner',
        duration: '20 hours',
        rating: 4.6,
        students: '150K+',
        link: 'https://www.coursera.org/learn/aws-cloud-technical-essentials'
      },
      {
        id: 5,
        title: 'React Native - The Practical Guide',
        platform: 'Udemy',
        type: 'paid',
        level: 'Intermediate',
        duration: '28 hours',
        rating: 4.7,
        students: '100K+',
        link: 'https://www.udemy.com/course/react-native-the-practical-guide/'
      },
      {
        id: 6,
        title: 'Python for Everybody',
        platform: 'Coursera',
        type: 'free',
        level: 'Beginner',
        duration: '35 hours',
        rating: 4.8,
        students: '2M+',
        link: 'https://www.coursera.org/specializations/python'
      }
    ],
    web: [
      // Web development specific courses
    ],
    data: [
      // Data science courses
    ],
    cloud: [
      // Cloud computing courses
    ]
  };

  const categories = [
    { id: 'all', name: 'All Courses', icon: '🌐' },
    { id: 'web', name: 'Web Development', icon: '💻' },
    { id: 'data', name: 'Data Science', icon: '📊' },
    { id: 'cloud', name: 'Cloud Computing', icon: '☁️' },
    { id: 'mobile', name: 'Mobile Development', icon: '📱' },
    { id: 'ai', name: 'AI & ML', icon: '🧠' }
  ];

  // UI state for courses fetched from backend (falls back to sample data)
  const [courses, setCourses] = useState(coursesData.all);
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
      const res = await fetch(`http://localhost:5000/api/courses?query=${encodeURIComponent(query)}&provider=all&limit=6`);
      if (!res.ok) throw new Error((await res.json()).message || res.statusText);
      const data = await res.json();
      // Map backend results to display-friendly objects
      const mapped = (data.courses || []).map((c, idx) => ({
        id: `remote-${idx}`,
        title: c.title || c.name || 'Untitled',
        platform: c.platform || c.channelTitle || 'Unknown',
        type: c.type || (c.platform === 'YouTube' ? 'free' : 'paid'),
        level: c.difficulty || 'Intermediate',
        duration: c.duration || (c.platform === 'YouTube' ? 'Video' : ''),
        rating: c.rating || c.avgRating || null,
        students: c.studentsEnrolled || c.numStudents || null,
        link: c.link || c.url || c.videoUrl || '#'
      }));

      if (mapped.length) setCourses(mapped);
      else setCourses(coursesData[selectedCategory] || coursesData.all);
    } catch (err) {
      console.error('fetchCourses error', err.message || err);
      setError(err.message || 'Failed to fetch courses');
      setCourses(coursesData[selectedCategory] || coursesData.all);
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
        {/* <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button> */}
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
          {error && <div className="error">{error}</div>}
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
                <span 
                  className={`platform ${course.platform === 'YouTube' || course.duration === 'Video' ? 'platform-label' : ''}`}
                  data-platform={course.platform === 'YouTube' ? 'youtube' : course.duration === 'Video' ? 'video' : ''}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{marginRight: '2px'}}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                  {course.platform === 'YouTube' ? 'YouTube' : course.duration === 'Video' ? 'Video' : course.platform}
                </span>
                {course.duration !== 'Video' && (
                  <span className="duration">⏱️ {course.duration}</span>
                )}
                <span className="rating">⭐ {course.rating}</span>
                <span className="students">👥 {course.students}</span>
              </div>
              <button 
                className="enroll-btn"
                onClick={() => {
                  const link = course.link || '';
                  if (/youtube\.com|youtu\.be/.test(link)) {
                    setVideoUrl(link);
                  } else {
                    window.open(link, '_blank', 'noopener,noreferrer');
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
        <VideoModal src={videoUrl} onClose={() => setVideoUrl(null)} />
      )}
    </div>
  );
};

export default UpskillCourses;
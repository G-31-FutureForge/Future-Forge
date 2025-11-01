import React, { useState } from 'react';
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

  const filteredCourses = coursesData[selectedCategory] || coursesData.all;

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
          {filteredCourses.map(course => (
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
                <span className="rating">⭐ {course.rating}</span>
                <span className="students">👥 {course.students}</span>
              </div>
              <button 
                className="enroll-btn"
                onClick={() => window.open(course.link, '_blank')}
              >
                Enroll Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpskillCourses;
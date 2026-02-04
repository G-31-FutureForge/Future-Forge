import React, { useState, useEffect } from 'react';
import './Career.css';
import { 
  GraduationCap, BookOpen, Briefcase, TrendingUp, Users, Award,
  ChevronDown, Filter, BarChart3, Clock, DollarSign, Target,
  Info, AlertCircle, RefreshCw, Search, ExternalLink, ArrowRight,
  Star, Zap, TrendingDown, CheckCircle, XCircle, Menu, Grid,
  Bookmark, Share2, Download, Eye, EyeOff, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Career = () => {
  const [educationLevel, setEducationLevel] = useState('after12th');
  const [coursesData, setCoursesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [favorites, setFavorites] = useState([]);

  const educationLevels = [
    { value: 'after10th', label: '10th Grade', description: 'Diploma, ITI, Vocational & Certification Courses', icon: BookOpen },
    { value: 'after12th', label: '12th Grade', description: 'Degrees, Professional & Government Exam Paths', icon: GraduationCap },
    { value: 'graduation', label: 'Graduation', description: 'Post-Graduate, Certifications & Career Options', icon: Briefcase }
  ];

  // Fetch courses when education level changes
  useEffect(() => {
    fetchCourses(educationLevel);
  }, [educationLevel]);

  const fetchCourses = async (level) => {
    setLoading(true);
    setError(null);
    setExpandedCourse(null);
    try {
      // Simulate API delay for animation
      await new Promise(resolve => setTimeout(resolve, 800));
      const response = await fetch(`http://localhost:5000/api/courses/by-education/${level}`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      const result = await response.json();
      setCoursesData(result.data);
      setSelectedStream(null);
    } catch (err) {
      setError(err.message);
      setCoursesData(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (courseId) => {
    setFavorites(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const toggleCourseExpansion = (courseId, e) => {
    e?.stopPropagation();
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const getDemandIcon = (demand) => {
    switch(demand?.toLowerCase()) {
      case 'high':
      case 'very high':
        return <TrendingUp className="icon-sm" />;
      case 'medium':
        return <BarChart3 className="icon-sm" />;
      case 'low':
        return <TrendingDown className="icon-sm" />;
      default:
        return <Info className="icon-sm" />;
    }
  };

  const getDemandColor = (demand) => {
    switch(demand?.toLowerCase()) {
      case 'very high': return 'var(--success-color)';
      case 'high': return 'var(--success-light)';
      case 'medium': return 'var(--warning-color)';
      case 'low': return 'var(--danger-light)';
      default: return 'var(--secondary-color)';
    }
  };

  const currentLevel = educationLevels.find(l => l.value === educationLevel);
  const CurrentLevelIcon = currentLevel?.icon || GraduationCap;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="career-container"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="career-header"
      >
        <div className="header-content">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="header-icon"
          >
            <GraduationCap size={32} />
          </motion.div>
          <div>
            <h1>Career Guidance System</h1>
            <p className="subtitle">Discover India-specific courses and career paths based on your education level</p>
          </div>
        </div>
      </motion.div>

      {/* Education Level Selector */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="education-selector-card"
      >
        <div className="selector-content">
          <div className="selector-header">
            <h3><BookOpen className="icon-xs" /> Select Education Level</h3>
            <div className="level-indicator">
              <motion.span 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="indicator-dot"
              />
              <span>Step 1 of 3</span>
            </div>
          </div>
          <div className="selector-body">
            <div className="select-wrapper">
              <select
                id="education-level"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="professional-select"
              >
                {educationLevels.map(level => {
                  const Icon = level.icon;
                  return (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  );
                })}
              </select>
              <div className="select-icon">
                <CurrentLevelIcon size={20} />
              </div>
              <div className="select-arrow">
                <ChevronDown size={20} />
              </div>
            </div>
            {currentLevel && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="level-info"
              >
                <Info className="info-icon" size={16} />
                <p>{currentLevel.description}</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="loading-container"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="loading-spinner"
            >
              <RefreshCw size={40} />
            </motion.div>
            <p className="loading-text">Loading career options...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="error-container"
          >
            <AlertCircle className="error-icon" size={24} />
            <div className="error-content">
              <h4>Unable to Load Data</h4>
              <p>{error}</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="retry-btn"
                onClick={() => fetchCourses(educationLevel)}
              >
                <RefreshCw size={16} />
                Retry
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence>
        {coursesData && !loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="career-content"
          >
            {/* Dashboard Stats */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="dashboard-stats"
            >
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="stat-card"
              >
                <div className="stat-icon">
                  <BookOpen size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Total Courses</span>
                  <span className="stat-value">{coursesData.totalCourses}</span>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="stat-card"
              >
                <div className="stat-icon">
                  <Award size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Available Streams</span>
                  <span className="stat-value">{coursesData.streams?.length || 0}</span>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="stat-card"
              >
                <div className="stat-icon">
                  <Briefcase size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Career Paths</span>
                  <span className="stat-value">100+</span>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="stat-card"
              >
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-label">Avg. Salary</span>
                  <span className="stat-value">₹6-12 LPA</span>
                </div>
              </motion.div>
            </motion.div>

            {/* View Mode Toggle and Filter */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="view-controls"
            >
              <div className="view-toggle">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={18} />
                  Grid View
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <Menu size={18} />
                  List View
                </motion.button>
              </div>
              
              {coursesData.streams && coursesData.streams.length > 0 && (
                <div className="filter-section">
                  <div className="filter-header">
                    <h3><Filter size={18} /> Filter by Stream</h3>
                    <span className="filter-count">
                      {selectedStream ? `1 selected` : `All streams`}
                    </span>
                  </div>
                  <div className="filter-tags">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`filter-tag ${!selectedStream ? 'active' : ''}`}
                      onClick={() => setSelectedStream(null)}
                    >
                      All Streams
                      <span className="tag-badge">{coursesData.totalCourses}</span>
                    </motion.button>
                    {coursesData.streams.map(stream => {
                      const count = coursesData.coursesByType 
                        ? Object.values(coursesData.coursesByType)
                            .flat()
                            .filter(course => course.stream === stream).length
                        : 0;
                      
                      return (
                        <motion.button
                          key={stream}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`filter-tag ${selectedStream === stream ? 'active' : ''}`}
                          onClick={() => setSelectedStream(stream)}
                        >
                          {stream}
                          <span className="tag-badge">{count}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Courses Sections */}
            <AnimatePresence mode="wait">
              {coursesData.coursesByType && Object.keys(coursesData.coursesByType).length > 0 ? (
                <motion.div 
                  key="courses-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="courses-sections"
                >
                  {Object.entries(coursesData.coursesByType).map(([courseType, courses], sectionIndex) => {
                    const filteredCourses = selectedStream
                      ? courses.filter(course => course.stream === selectedStream)
                      : courses;

                    if (filteredCourses.length === 0) return null;

                    return (
                      <motion.div 
                        key={courseType}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
                        className="section-wrapper"
                      >
                        <div className="section-header">
                          <div className="section-title-wrapper">
                            <h2 className="section-title">
                              <Zap className="icon-sm" /> {courseType}
                            </h2>
                            <div className="section-line"></div>
                          </div>
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="section-count"
                          >
                            <span className="count-number">{filteredCourses.length}</span>
                            <span className="count-text">courses</span>
                          </motion.div>
                        </div>
                        
                        <div className={`${viewMode === 'grid' ? 'compact-cards-grid' : 'compact-cards-list'}`}>
                          {filteredCourses.map((course, index) => {
                            const courseId = `${courseType}-${index}`;
                            const isExpanded = expandedCourse === courseId;
                            const isFavorite = favorites.includes(courseId);
                            
                            return (
                              <motion.div 
                                key={index}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ 
                                  y: -8,
                                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
                                }}
                                className={`compact-course-card ${isExpanded ? 'expanded' : ''}`}
                                onClick={(e) => toggleCourseExpansion(courseId, e)}
                              >
                                <div className="card-content">
                                  {/* Card Header */}
                                  <div className="card-header">
                                    <div className="course-title-wrapper">
                                      <h3 className="course-title">
                                        {course.courseName}
                                      </h3>
                                      <div className="course-actions">
                                        <motion.button
                                          whileHover={{ scale: 1.2 }}
                                          whileTap={{ scale: 0.9 }}
                                          className="action-btn favorite-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(courseId);
                                          }}
                                        >
                                          <Heart 
                                            size={18} 
                                            fill={isFavorite ? "currentColor" : "none"}
                                            className={isFavorite ? "favorite-active" : ""}
                                          />
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.2 }}
                                          whileTap={{ scale: 0.9 }}
                                          className="action-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Share functionality
                                          }}
                                        >
                                          <Share2 size={18} />
                                        </motion.button>
                                      </div>
                                    </div>
                                    
                                    <div className="course-meta-compact">
                                      <span className="meta-item">
                                        <Clock className="icon-xs" />
                                        {course.duration}
                                      </span>
                                      {course.stream && (
                                        <span className="meta-item stream">
                                          <BookOpen className="icon-xs" />
                                          {course.stream}
                                        </span>
                                      )}
                                      {course.salary && course.salary !== 'N/A' && (
                                        <span className="meta-item salary">
                                          <DollarSign className="icon-xs" />
                                          {course.salary}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Demand Indicator */}
                                  <div className="demand-indicator">
                                    <div className="demand-header">
                                      <span className="demand-label">
                                        {getDemandIcon(course.demand)}
                                        {course.demand || 'Demand: N/A'}
                                      </span>
                                      <motion.div 
                                        animate={{ 
                                          backgroundColor: getDemandColor(course.demand)
                                        }}
                                        className="demand-badge"
                                      />
                                    </div>
                                    <div className="demand-bar">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ 
                                          width: course.demand === 'Very High' ? '90%' : 
                                                 course.demand === 'High' ? '75%' :
                                                 course.demand === 'Medium' ? '50%' : '25%'
                                        }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                        className={`demand-fill ${course.demand?.toLowerCase().replace(/\s+/g, '-')}`}
                                      />
                                    </div>
                                  </div>

                                  {/* Expanded Content */}
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="expanded-content"
                                      >
                                        <div className="career-paths-expanded">
                                          <h4><Target className="icon-xs" /> Career Opportunities</h4>
                                          <div className="paths-grid">
                                            {course.careerPaths && course.careerPaths.length > 0 ? (
                                              course.careerPaths.map((path, idx) => (
                                                <motion.div 
                                                  key={idx}
                                                  initial={{ opacity: 0, x: -20 }}
                                                  animate={{ opacity: 1, x: 0 }}
                                                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                                                  whileHover={{ x: 5 }}
                                                  className="path-item"
                                                >
                                                  <div className="path-icon">
                                                    <ArrowRight size={16} />
                                                  </div>
                                                  <span>{path}</span>
                                                </motion.div>
                                              ))
                                            ) : (
                                              <div className="no-paths">
                                                <Info size={16} />
                                                Career information pending
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  {/* Card Footer */}
                                  <div className="card-footer">
                                    <motion.button 
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="expand-btn"
                                      onClick={(e) => toggleCourseExpansion(courseId, e)}
                                    >
                                      {isExpanded ? 'Show Less' : 'View Details'}
                                      <motion.div
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                      >
                                        <ChevronDown size={16} />
                                      </motion.div>
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div 
                  key="no-courses"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="no-results"
                >
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="no-results-icon"
                  >
                    <Search size={48} />
                  </motion.div>
                  <h3>No Courses Found</h3>
                  <p>Try selecting a different stream or education level</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="reset-filter-btn"
                    onClick={() => setSelectedStream(null)}
                  >
                    <Filter size={16} />
                    Reset Filter
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Career;
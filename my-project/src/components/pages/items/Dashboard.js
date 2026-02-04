import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [jobsCount, setJobsCount] = useState(0);
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }

        setTimeout(() => {
            setIsLoaded(true);
        }, 400);

        // Fetch real job count (jobs posted from recruiter portal are stored in MongoDB)
        const fetchJobsCount = async () => {
            try {
                // Using backend pagination response: total = total available open jobs
                const response = await fetch('/api/jobs?page=1&limit=1');
                const data = await response.json();

                if (response.ok && data?.success) {
                    setJobsCount(Number(data.total) || 0);
                } else {
                    setJobsCount(0);
                }
            } catch (error) {
                console.error('Error fetching job count:', error);
                setJobsCount(0);
            }
        };

        // Fetch recommended courses from all platforms
        const fetchRecommendedCourses = async () => {
            try {
                const { fetchAndNormalizeCourses, COURSE_PROVIDERS } = await import('../../../utils/courseApi');
                // Fetch popular programming/development courses from all platforms
                const courses = await fetchAndNormalizeCourses('programming tutorial', COURSE_PROVIDERS.ALL, 3);
                const mappedCourses = courses.map((course, index) => ({
                    id: index + 1,
                    name: course.title || 'Untitled Course',
                    platform: course.platform || 'Unknown',
                    link: course.link || '#'
                }));
                setCourses(mappedCourses);
            } catch (error) {
                console.error('Error fetching courses:', error);
                // Fallback to empty array on error
                setCourses([]);
            }
        };

        fetchRecommendedCourses();
        fetchJobsCount();
    }, [navigate]);

    const getUserFirstName = () => {
        if (!user) return 'User';
        return user.firstName || user.firstname || user.name || user.username || 'User';
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="dashboard-container">
            <main className="dashboard-main">
                {/* Header Section */}
                <section className="dashboard-header">
                    <div className="header-content">
                        <h1>Welcome back, {getUserFirstName()}! 👋</h1>
                        <p>Ready to continue your career journey? Here's what's happening today.</p>
                    </div>
                </section>

                {/* Stats Section with Glass Design */}
                <section className="stats-section">
                    <div className="section-header">
                        <h2>Your Progress Overview</h2>
                        <p>Track your career development journey</p>
                    </div>
                    <div className="stats-grid">
                        <div className="glass-stat-card">
                            <div className="stat-content-wrapper">
                                <div className="stat-info-side">
                                    <div className="stat-icon">🚀</div>
                                    <div className="stat-main-info">
                                        <h3>92%</h3>
                                        <p>Resume Score</p>
                                    </div>
                                    <div className="stat-details">
                                        <span>+5% from last month</span>
                                    </div>
                                </div>
                                <div className="stat-action-side">
                                    <button className="glass-action-btn" onClick={() => navigate('/resume-builder')}>
                                        Improve
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="glass-stat-card">
                            <div className="stat-content-wrapper">
                                <div className="stat-info-side">
                                    <div className="stat-icon">💼</div>
                                    <div className="stat-main-info">
                                        <h3>{jobsCount}</h3>
                                        <p>Jobs Available on Future-Forge</p>
                                    </div>
                                    <div className="stat-details">
                                        
                                    </div>
                                </div>
                                <div className="stat-action-side">
                                    <button className="glass-action-btn" onClick={() => navigate('/jobs-exploration')}>
                                        Explore
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="glass-stat-card">
                            <div className="stat-content-wrapper">
                                <div className="stat-info-side">
                                    <div className="stat-icon">📚</div>
                                    <div className="stat-main-info">
                                        <h3>{courses.length}</h3>
                                        <p>Courses Suggested </p>
                                    </div>
                                    <div className="stat-details">
                                        <span>Based on your profile</span>
                                    </div>
                                </div>
                                <div className="stat-action-side">
                                    <button className="glass-action-btn" onClick={() => navigate('/upskill-courses')}>
                                        View All
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Actions with Glass Design */}
                <section className="quick-actions-section">
                    <div className="section-header">
                        <h2>Quick Actions</h2>
                        <p>Get started with these essential tools</p>
                    </div>
                    <div className="actions-grid">
                        {/* Resume Builder Section */}
                        <div className="glass-action-section">
                            <div className="glass-action-card">
                                <div className="action-content-wrapper">
                                    <div className="action-info-side">
                                        <div className="action-icon">📝</div>
                                        <div className="action-main-info">
                                            <h3>Resume Builder</h3>
                                            <p>Enhance your resume using AI suggestions and professional templates</p>
                                        </div>
                                        <div className="action-stats">
                                            <div className="stat-item">
                                                <span className="stat-number">200+</span>
                                                <span className="stat-label">Templates</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-number">95%</span>
                                                <span className="stat-label">Success Rate</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="action-button-side">
                                        <button className="glass-primary-btn" onClick={() => navigate('/resume-builder')}>
                                            Open Builder
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Job Finder Section */}
                        <div className="glass-action-section">
                            <div className="glass-action-card">
                                <div className="action-content-wrapper">
                                    <div className="action-info-side">
                                        <div className="action-icon">🔍</div>
                                        <div className="action-main-info">
                                            <h3>Find Jobs</h3>
                                            <p>Explore roles perfectly matched to your skills and preferences</p>
                                        </div>
                                        <div className="action-stats">
                                            <div className="stat-item">
                                                <span className="stat-number">500+</span>
                                                <span className="stat-label">New Jobs</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-number">326</span>
                                                <span className="stat-label">Companies</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="action-button-side">
                                        <button className="glass-primary-btn" onClick={() => navigate('/jobs-exploration')}>
                                            Explore Jobs
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Learning Section */}
                        <div className="glass-action-section">
                            <div className="glass-action-card">
                                <div className="action-content-wrapper">
                                    <div className="action-info-side">
                                        <div className="action-icon">🎓</div>
                                        <div className="action-main-info">
                                            <h3>Upskill Yourself</h3>
                                            <p>Access personalized learning paths and recommended courses</p>
                                        </div>
                                        <div className="action-stats">
                                            <div className="stat-item">
                                                <span className="stat-number">200M+</span>
                                                <span className="stat-label">Students</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-number">50+</span>
                                                <span className="stat-label">Courses</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="action-button-side">
                                        <button className="glass-primary-btn" onClick={() => navigate('/upskill-courses')}>
                                            Start Learning
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skill Analyzer Section */}
                        <div className="glass-action-section">
                            <div className="glass-action-card">
                                <div className="action-content-wrapper">
                                    <div className="action-info-side">
                                        <div className="action-icon">📊</div>
                                        <div className="action-main-info">
                                            <h3>Skill Gap Analyzer</h3>
                                            <p>Analyze your skills against job requirements and get insights</p>
                                        </div>
                                        <div className="action-stats">
                                            <div className="stat-item">
                                                <span className="stat-number">15+</span>
                                                <span className="stat-label">Skills Analyzed</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-number">5</span>
                                                <span className="stat-label">Gap Areas</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="action-button-side">
                                        <button className="glass-primary-btn" onClick={() => navigate('/skill-gap-analyzer')}>
                                            Analyze Skills
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
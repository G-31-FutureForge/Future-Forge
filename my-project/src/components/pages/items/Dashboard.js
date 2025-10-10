import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoaded, setIsLoaded] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            navigate('/login');
        }

        setTimeout(() => {
            setIsLoaded(true);
        }, 400);

        // Mock Data (replace with backend later)
        setJobs([
            { id: 1, title: 'Frontend Developer', company: 'TechNova', status: 'Applied' },
            { id: 2, title: 'AI Engineer', company: 'FutureLabs', status: 'Recommended' },
            { id: 3, title: 'UI/UX Designer', company: 'Designify', status: 'Interview' },
        ]);

        setCourses([
            { id: 1, name: 'React for Beginners', platform: 'Coursera' },
            { id: 2, name: 'Machine Learning Basics', platform: 'Udemy' },
            { id: 3, name: 'Data Structures Mastery', platform: 'edX' },
        ]);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <Link to="/dashboard" className="logo">Future Forge</Link>
                        <nav className="dashboard-nav">
                            <button 
                                className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >Overview</button>
                            <button 
                                className={`nav-btn ${activeTab === 'career' ? 'active' : ''}`}
                                onClick={() => setActiveTab('career')}
                            >Career</button>
                            <button 
                                className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >Profile</button>
                        </nav>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span>Welcome, {user.firstName}!</span>
                            <button onClick={handleLogout} className="logout-btn">Logout</button>
                        </div>
                    </div>
                </div>
            </header>
            

            {/* Main Content */}
            <main className="dashboard-main">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <>
                        <section className="welcome-section">
                            <div className="welcome-content">
                                <h1>Welcome to Your Dashboard, {user.firstName}! 🎉</h1>
                                <p>You've successfully joined Future Forge. Start exploring your new workspace.</p>
                                <div className="welcome-stats">
                                    <div className="stat-card">
                                        <div className="stat-icon">🚀</div>
                                        <div className="stat-info">
                                            <h3>92%</h3>
                                            <p>Resume Score</p>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">💼</div>
                                        <div className="stat-info">
                                            <h3>{jobs.length}</h3>
                                            <p>Jobs Available</p>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">📚</div>
                                        <div className="stat-info">
                                            <h3>{courses.length}</h3>
                                            <p>Courses Suggested</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Quick Actions */}
                        <section className="quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="actions-grid">
                                <div className="action-card">
                                    <div className="action-icon">📝</div>
                                    <h3>Resume Builder</h3>
                                    <p>Enhance your resume using AI suggestions</p>
                                    <button className="action-btn" onClick={() => navigate('/resume-builder')}>Open</button>
                                </div>
                                <div className="action-card">
                                    <div className="action-icon">🔍</div>
                                    <h3>Find Jobs</h3>
                                    <p>Explore roles matched to your profile</p>
                                    <button className="action-btn">Explore</button>
                                </div>
                                <div className="action-card">
                                    <div className="action-icon">🎓</div>
                                    <h3>Upskill Yourself</h3>
                                    <p>Access recommended learning courses</p>
                                    <button className="action-btn">Start Learning</button>
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {/* CAREER TAB */}
                {activeTab === 'career' && (
                    <section className="career-section">
                        <h2>Career Growth Hub</h2>

                        <div className="jobs-section">
                            <h3>Recommended Jobs</h3>
                            <div className="job-list">
                                {jobs.map(job => (
                                    <div key={job.id} className={`job-card ${job.status.toLowerCase()}`}>
                                        <h4>{job.title}</h4>
                                        <p>{job.company}</p>
                                        <span className="job-status">{job.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="courses-section">
                            <h3>Suggested Learning Paths</h3>
                            <div className="course-list">
                                {courses.map(course => (
                                    <div key={course.id} className="course-card">
                                        <h4>{course.name}</h4>
                                        <p>Platform: {course.platform}</p>
                                        <button className="btn-small">Explore</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <section className="profile-section">
                        <h2>Your Profile</h2>
                        <div className="profile-card">
                            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Member Since:</strong> Today</p>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default Dashboard;

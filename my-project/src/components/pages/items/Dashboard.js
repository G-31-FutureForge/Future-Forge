import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Dashboard.css';
import JobExploration from './JobExploration';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoaded, setIsLoaded] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [courses, setCourses] = useState([]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        console.log('Raw user data from localStorage:', userData); // Debug log
        
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                console.log('Parsed user object:', parsedUser); // Debug log
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }

        // Check for tab parameter in URL
        const tabParam = searchParams.get('tab');
        if (tabParam && ['overview', 'career', 'profile'].includes(tabParam)) {
            setActiveTab(tabParam);
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
    }, [navigate, searchParams]);

    // Safe user data access
    const getUserFirstName = () => {
        if (!user) return 'User';
        
        // Check different possible property names
        return user.firstName || user.firstname || user.name || user.username || 'User';
    };

    const getUserLastName = () => {
        if (!user) return '';
        
        return user.lastName || user.lastname || '';
    };

    const getUserEmail = () => {
        if (!user) return 'No email provided';
        
        return user.email || user.mail || 'No email provided';
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="dashboard-container">
            {/* Dashboard Navigation */}
            <div className="dashboard-nav-container">
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

            {/* Main Content */}
            <main className="dashboard-main">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <>
                        <section className="welcome-section">
                            <div className="welcome-content">
                                <h1>Welcome to Your Dashboard, {getUserFirstName()}! 🎉</h1>
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
    <button 
        className="action-btn" 
        onClick={() => navigate('/jobs-exploration')}
    >
        Explore Jobs
    </button>
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

                        <div className="career-status-section">
                            <h3>Your Job Status</h3>
                            <div className="job-status-list">
                                {jobs.map(job => (
                                    <div key={job.id} className={`job-status-card ${job.status.toLowerCase()}`}>
                                        <h4>{job.title}</h4>
                                        <p>{job.company}</p>
                                        <span className="job-status">{job.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="jobs-exploration-section">
                            <h3>Explore New Opportunities</h3>
                            <JobExploration />
                        </div>

                        <div className="courses-section">
                            <h3>Recommended Learning Paths</h3>
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
                            <p>
                                <strong>Name:</strong> 
                                <span>{getUserFirstName()}</span>
                            </p>
                            <p>
                                <strong>Email:</strong> 
                                <span>{getUserEmail()}</span>
                            </p>
                            <p>
                                <strong>Member Since:</strong> 
                                <span>Today</span>
                            </p>
                            {/* Debug information - you can remove this later */}
                           
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default Dashboard;   
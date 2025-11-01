import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        console.log('Raw user data from localStorage:', userData);
        
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                console.log('Parsed user object:', parsedUser);
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

        // Mock Data
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

    // Safe user data access
    const getUserFirstName = () => {
        if (!user) return 'User';
        return user.firstName || user.firstname || user.name || user.username || 'User';
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="dashboard-container">
            {/* Main Content - No sidebar here, using global sidebar */}
            <main className="dashboard-main">
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
  <button 
    className="action-btn" 
    onClick={() => navigate('/upskill-courses')}
  >
    Start Learning
  </button>
</div>
<div className="action-card">
  <div className="action-icon">🔍</div>
  <h3>Skill Gap Analyzer</h3>
  <p>Analyze your skills against job requirements</p>
  <button 
    className="action-btn" 
    onClick={() => navigate('/skill-gap-analyzer')}
  >
    Analyze Skills
  </button>
</div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
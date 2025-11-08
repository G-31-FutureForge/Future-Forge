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

        // Mock Data for jobs
        setJobs([
            { id: 1, title: 'Frontend Developer', company: 'TechNova', status: 'Applied' },
            { id: 2, title: 'AI Engineer', company: 'FutureLabs', status: 'Recommended' },
            { id: 3, title: 'UI/UX Designer', company: 'Designify', status: 'Interview' },
        ]);

        // Fetch recommended courses from YouTube API
        const fetchRecommendedCourses = async () => {
            try {
                // Fetch popular programming/development courses
                const response = await fetch('http://localhost:5000/api/courses?query=programming tutorial&provider=youtube&limit=3');
                if (response.ok) {
                    const data = await response.json();
                    const mappedCourses = (data.courses || []).map((course, index) => ({
                        id: index + 1,
                        name: course.title || 'Untitled Course',
                        platform: course.platform || course.channelTitle || 'YouTube',
                        link: course.link || '#'
                    }));
                    setCourses(mappedCourses);
                } else {
                    console.error('Failed to fetch courses:', response.statusText);
                    // Fallback to empty array if API fails
                    setCourses([]);
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
                // Fallback to empty array on error
                setCourses([]);
            }
        };

        fetchRecommendedCourses();
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
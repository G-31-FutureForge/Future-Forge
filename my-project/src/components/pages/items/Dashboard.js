
// yeh file create account button click krne pr use krna hai isliye ye render kr dio regidter button click hone pe

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <Link to="/dashboard" className="logo">
                            Future Forge
                        </Link>
                        <nav className="dashboard-nav">
                            <button 
                                className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                Overview
                            </button>
                            <button 
                                className={`nav-btn ${activeTab === 'projects' ? 'active' : ''}`}
                                onClick={() => setActiveTab('projects')}
                            >
                                Projects
                            </button>
                            <button 
                                className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                Profile
                            </button>
                        </nav>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span>Welcome, {user.firstName}!</span>
                            <button onClick={handleLogout} className="logout-btn">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Welcome Section */}
                <section className="welcome-section">
                    <div className="welcome-content">
                        <h1>Welcome to Your Dashboard, {user.firstName}! 🎉</h1>
                        <p>You've successfully joined Future Forge. Start exploring your new workspace.</p>
                        <div className="welcome-stats">
                            <div className="stat-card">
                                <div className="stat-icon">🚀</div>
                                <div className="stat-info">
                                    <h3>0</h3>
                                    <p>Projects Created</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">⭐</div>
                                <div className="stat-info">
                                    <h3>New</h3>
                                    <p>Account Status</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-info">
                                    <h3>Today</h3>
                                    <p>Member Since</p>
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
                            <div className="action-icon">🛠️</div>
                            <h3>Create Project</h3>
                            <p>Start a new project from scratch</p>
                            <button className="action-btn">Get Started</button>
                        </div>
                        <div className="action-card">
                            <div className="action-icon">📚</div>
                            <h3>View Tutorials</h3>
                            <p>Learn how to use Future Forge</p>
                            <button className="action-btn">Learn More</button>
                        </div>
                        <div className="action-card">
                            <div className="action-icon">👥</div>
                            <h3>Invite Team</h3>
                            <p>Collaborate with your team members</p>
                            <button className="action-btn">Invite</button>
                        </div>
                        <div className="action-card">
                            <div className="action-icon">⚙️</div>
                            <h3>Settings</h3>
                            <p>Customize your workspace</p>
                            <button className="action-btn">Configure</button>
                        </div>
                    </div>
                </section>

                {/* Recent Activity */}
                <section className="recent-activity">
                    <h2>Recent Activity</h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon">🎯</div>
                            <div className="activity-content">
                                <p><strong>Account Created</strong></p>
                                <p>Welcome to Future Forge! Your account has been successfully created.</p>
                                <span className="activity-time">Just now</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon">📧</div>
                            <div className="activity-content">
                                <p><strong>Email Verified</strong></p>
                                <p>Your email address has been confirmed.</p>
                                <span className="activity-time">Just now</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Getting Started */}
                <section className="getting-started">
                    <h2>Getting Started</h2>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3>Complete Your Profile</h3>
                            <p>Add more details to your profile to get personalized recommendations.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3>Create Your First Project</h3>
                            <p>Start building something amazing with our tools and templates.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3>Invite Your Team</h3>
                            <p>Collaborate with others to bring your ideas to life faster.</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
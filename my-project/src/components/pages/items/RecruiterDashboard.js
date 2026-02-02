// src/components/pages/items/RecruiterDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecruiterDashboard.css';

const RecruiterDashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const userType = localStorage.getItem('userType');

        if (userData && userType === 'recruiter') {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const getUserFirstName = () => {
        if (!user) return 'Recruiter';
        return user.firstName || user.firstname || user.name || user.username || 'Recruiter';
    };

    if (!user) return <div className="recruiter-loading">Loading...</div>;

    return (
        <div className="recruiter-dashboard">
            <div className="recruiter-dashboard-header">
                <h1>Recruiter Dashboard</h1>
                <p>Welcome back, {getUserFirstName()}! Choose an action below.</p>
            </div>

            <div className="recruiter-actions">
                <button
                    className="recruiter-action-card post-job"
                    onClick={() => navigate('/recruiter/post-job')}
                >
                    <span className="action-icon">📋</span>
                    <h3>Post Job</h3>
                    <p>Create and publish a new job posting</p>
                </button>

                <button
                    className="recruiter-action-card search-candidates"
                    onClick={() => navigate('/recruiter/candidates')}
                >
                    <span className="action-icon">🔍</span>
                    <h3>Search Candidates</h3>
                    <p>Find candidates by name, skills, or profile</p>
                </button>

                <button
                    className="recruiter-action-card view-candidates"
                    onClick={() => navigate('/recruiter/candidates')}
                >
                    <span className="action-icon">👥</span>
                    <h3>View All Candidates</h3>
                    <p>Browse all registered student candidates</p>
                </button>
            </div>
        </div>
    );
};

export default RecruiterDashboard;

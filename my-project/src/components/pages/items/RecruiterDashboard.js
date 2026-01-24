// src/components/pages/items/RecruiterDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecruiterDashboard.css';

const RecruiterDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalCandidates: 0,
        activeJobs: 0,
        interviewsToday: 0,
        conversionRate: 0
    });
    const [recentCandidates, setRecentCandidates] = useState([]);
    const [activeJobs, setActiveJobs] = useState([]);
    const [upcomingInterviews, setUpcomingInterviews] = useState([]);
    const [recruitmentMetrics, setRecruitmentMetrics] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const userType = localStorage.getItem('userType');
        
        if (userData && userType === 'recruiter') {
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

        // Fetch dashboard data
        fetchDashboardData();
    }, [navigate]);

    const fetchDashboardData = async () => {
        // Mock data - in production, this would be API calls
        setStats({
            totalCandidates: 156,
            activeJobs: 8,
            interviewsToday: 5,
            conversionRate: 42
        });

        setRecentCandidates([
            { id: 1, name: 'Alex Johnson', role: 'Senior Frontend Developer', status: 'New', match: 95, appliedDate: '2024-01-15', avatar: 'AJ' },
            { id: 2, name: 'Sarah Williams', role: 'Product Manager', status: 'Shortlisted', match: 88, appliedDate: '2024-01-14', avatar: 'SW' },
            { id: 3, name: 'Michael Chen', role: 'DevOps Engineer', status: 'Interview', match: 92, appliedDate: '2024-01-13', avatar: 'MC' },
            { id: 4, name: 'Emily Rodriguez', role: 'UX Designer', status: 'Offer', match: 97, appliedDate: '2024-01-12', avatar: 'ER' },
            { id: 5, name: 'David Kim', role: 'Backend Developer', status: 'Rejected', match: 78, appliedDate: '2024-01-11', avatar: 'DK' },
        ]);

        setActiveJobs([
            { id: 1, title: 'Senior React Developer', department: 'Engineering', applications: 45, openings: 2, status: 'active', postedDate: '2024-01-10' },
            { id: 2, title: 'Product Designer', department: 'Design', applications: 32, openings: 1, status: 'active', postedDate: '2024-01-08' },
            { id: 3, title: 'Data Scientist', department: 'Analytics', applications: 28, openings: 3, status: 'active', postedDate: '2024-01-05' },
            { id: 4, title: 'DevOps Engineer', department: 'Engineering', applications: 19, openings: 2, status: 'closing', postedDate: '2023-12-20' },
        ]);

        setUpcomingInterviews([
            { id: 1, candidateName: 'John Smith', role: 'Frontend Developer', time: '10:00 AM', type: 'Technical', interviewer: 'Emma Wilson' },
            { id: 2, candidateName: 'Lisa Wang', role: 'Product Manager', time: '2:00 PM', type: 'Behavioral', interviewer: 'Mark Davis' },
            { id: 3, candidateName: 'Robert Brown', role: 'Backend Developer', time: '4:30 PM', type: 'Technical', interviewer: 'Sarah Lee' },
        ]);

        setRecruitmentMetrics([
            { label: 'Time to Hire', value: '24 days', trend: '-2 days', positive: true },
            { label: 'Cost per Hire', value: '$4,200', trend: '-$300', positive: true },
            { label: 'Quality of Hire', value: '8.5/10', trend: '+0.3', positive: true },
            { label: 'Candidate Drop-off', value: '15%', trend: '-2%', positive: true },
        ]);
    };

    const getUserFirstName = () => {
        if (!user) return 'Recruiter';
        return user.firstName || user.firstname || user.name || user.username || 'Recruiter';
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': '#4CAF50',
            'Shortlisted': '#2196F3',
            'Interview': '#FF9800',
            'Offer': '#9C27B0',
            'Rejected': '#F44336',
            'active': '#4CAF50',
            'closing': '#FF9800'
        };
        return colors[status] || '#757575';
    };

    if (!user) return <div className="loading-container">Loading...</div>;

    return (
        <div className="recruiter-dashboard">
            {/* Top Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>Recruitment Dashboard</h1>
                    <p>Welcome back, {getUserFirstName()}! Here's your hiring overview.</p>
                </div>
                <div className="header-right">
                    <button className="primary-btn" onClick={() => navigate('/post-job')}>
                        <span className="btn-icon">+</span> Post New Job
                    </button>
                    <button className="secondary-btn" onClick={() => navigate('/candidates')}>
                        View All Candidates
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-icon total-candidates">👥</div>
                    <div className="stat-info">
                        <h3>{stats.totalCandidates}</h3>
                        <p>Total Candidates</p>
                        <span className="stat-trend positive">+24 this week</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon active-jobs">📋</div>
                    <div className="stat-info">
                        <h3>{stats.activeJobs}</h3>
                        <p>Active Jobs</p>
                        <span className="stat-trend neutral">3 need attention</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon interviews">🎯</div>
                    <div className="stat-info">
                        <h3>{stats.interviewsToday}</h3>
                        <p>Interviews Today</p>
                        <span className="stat-trend warning">Starts in 2h 30m</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon conversion">📈</div>
                    <div className="stat-info">
                        <h3>{stats.conversionRate}%</h3>
                        <p>Conversion Rate</p>
                        <span className="stat-trend positive">+5% from last month</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-content">
                {/* Left Column */}
                <div className="content-left">
                    {/* Recent Candidates */}
                    <div className="section-card">
                        <div className="section-header">
                            <h3>Recent Candidates</h3>
                            <button className="text-btn" onClick={() => navigate('/candidates')}>
                                View All →
                            </button>
                        </div>
                        <div className="candidates-list">
                            {recentCandidates.map(candidate => (
                                <div key={candidate.id} className="candidate-item">
                                    <div className="candidate-avatar" style={{ backgroundColor: getStatusColor(candidate.status) }}>
                                        {candidate.avatar}
                                    </div>
                                    <div className="candidate-details">
                                        <h4>{candidate.name}</h4>
                                        <p className="candidate-role">{candidate.role}</p>
                                        <div className="candidate-meta">
                                            <span className="match-badge">{candidate.match}% Match</span>
                                            <span className="date">{candidate.appliedDate}</span>
                                        </div>
                                    </div>
                                    <div className="candidate-status">
                                        <span 
                                            className="status-tag" 
                                            style={{ backgroundColor: getStatusColor(candidate.status) + '20', color: getStatusColor(candidate.status) }}
                                        >
                                            {candidate.status}
                                        </span>
                                        <button 
                                            className="action-btn"
                                            onClick={() => navigate(`/candidate/${candidate.id}`)}
                                        >
                                            View
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recruitment Metrics */}
                    <div className="section-card">
                        <div className="section-header">
                            <h3>Recruitment Metrics</h3>
                            <button className="text-btn" onClick={() => navigate('/analytics')}>
                                Details →
                            </button>
                        </div>
                        <div className="metrics-grid">
                            {recruitmentMetrics.map((metric, index) => (
                                <div key={index} className="metric-item">
                                    <div className="metric-header">
                                        <span className="metric-label">{metric.label}</span>
                                        <span className={`metric-trend ${metric.positive ? 'positive' : 'negative'}`}>
                                            {metric.trend}
                                        </span>
                                    </div>
                                    <div className="metric-value">{metric.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="content-right">
                    {/* Active Job Postings */}
                    <div className="section-card">
                        <div className="section-header">
                            <h3>Active Job Postings</h3>
                            <button className="text-btn" onClick={() => navigate('/jobs-management')}>
                                Manage All →
                            </button>
                        </div>
                        <div className="jobs-list">
                            {activeJobs.map(job => (
                                <div key={job.id} className="job-item">
                                    <div className="job-header">
                                        <h4>{job.title}</h4>
                                        <span className="department-tag">{job.department}</span>
                                    </div>
                                    <div className="job-stats">
                                        <div className="stat">
                                            <span className="stat-value">{job.applications}</span>
                                            <span className="stat-label">Applications</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">{job.openings}</span>
                                            <span className="stat-label">Openings</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">{job.postedDate}</span>
                                            <span className="stat-label">Posted</span>
                                        </div>
                                    </div>
                                    <div className="job-footer">
                                        <span 
                                            className="status-badge" 
                                            style={{ backgroundColor: getStatusColor(job.status) + '20', color: getStatusColor(job.status) }}
                                        >
                                            {job.status}
                                        </span>
                                        <button 
                                            className="view-btn"
                                            onClick={() => navigate(`/job/${job.id}`)}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Interviews */}
                    <div className="section-card">
                        <div className="section-header">
                            <h3>Upcoming Interviews</h3>
                            <button className="text-btn" onClick={() => navigate('/calendar')}>
                                Calendar →
                            </button>
                        </div>
                        <div className="interviews-list">
                            {upcomingInterviews.map(interview => (
                                <div key={interview.id} className="interview-item">
                                    <div className="interview-time">
                                        <span className="time">{interview.time}</span>
                                        <span className="type">{interview.type}</span>
                                    </div>
                                    <div className="interview-details">
                                        <h4>{interview.candidateName}</h4>
                                        <p className="role">{interview.role}</p>
                                        <p className="interviewer">With {interview.interviewer}</p>
                                    </div>
                                    <div className="interview-actions">
                                        <button className="icon-btn" title="Reschedule">
                                            ↻
                                        </button>
                                        <button className="icon-btn" title="Join">
                                            📹
                                        </button>
                                        <button className="icon-btn" title="Details">
                                            →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="section-card">
                        <div className="section-header">
                            <h3>Quick Actions</h3>
                        </div>
                        <div className="quick-actions-grid">
                            <button className="quick-action" onClick={() => navigate('/candidate-search')}>
                                <span className="action-icon">🔍</span>
                                <span className="action-label">Search Candidates</span>
                            </button>
                            <button className="quick-action" onClick={() => navigate('/resume-screening')}>
                                <span className="action-icon">📄</span>
                                <span className="action-label">Screen Resumes</span>
                            </button>
                            <button className="quick-action" onClick={() => navigate('/schedule-interview')}>
                                <span className="action-icon">📅</span>
                                <span className="action-label">Schedule Interview</span>
                            </button>
                            <button className="quick-action" onClick={() => navigate('/analytics')}>
                                <span className="action-icon">📊</span>
                                <span className="action-label">View Analytics</span>
                            </button>
                            <button className="quick-action" onClick={() => navigate('/templates')}>
                                <span className="action-icon">📝</span>
                                <span className="action-label">Email Templates</span>
                            </button>
                            <button className="quick-action" onClick={() => navigate('/reports')}>
                                <span className="action-icon">📈</span>
                                <span className="action-label">Generate Reports</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;
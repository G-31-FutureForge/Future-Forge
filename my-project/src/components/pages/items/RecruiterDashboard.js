// src/components/pages/items/RecruiterDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecruiterDashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const RecruiterDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState('');
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

    useEffect(() => {
        if (!user) return;

        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            setStatsLoading(true);
            setStatsError('');

            try {
                const response = await fetch(`${API_BASE}/api/recruiter/dashboard-stats`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json().catch(() => ({}));
                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to load dashboard stats');
                }

                setStats(data.data || null);
            } catch (err) {
                setStats(null);
                setStatsError(err.message || 'Failed to load dashboard stats');
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    const getUserFirstName = () => {
        if (!user) return 'Recruiter';
        return user.firstName || user.firstname || user.name || user.username || 'Recruiter';
    };

    if (!user) return <div className="recruiter-loading">Loading...</div>;

    const formatNumber = (v) => {
        const n = Number(v);
        if (Number.isNaN(n)) return '0';
        return n.toLocaleString();
    };

    return (
        <div className="recruiter-dashboard">
            <div className="recruiter-dashboard-header">
                <h1>Recruiter Dashboard</h1>
                <p>Welcome back, {getUserFirstName()}! Choose an action below.</p>
            </div>

            <div className="recruiter-dashboard-layout">
                <aside className="recruiter-sidebar">
                    <div className="recruiter-sidebar-title">Quick Actions</div>
                    <div className="recruiter-sidebar-actions">
                        <button
                            type="button"
                            className="recruiter-sidebar-action"
                            onClick={() => navigate('/recruiter/post-job')}
                        >
                            <span className="sidebar-action-icon">📋</span>
                            <span className="sidebar-action-content">
                                <span className="sidebar-action-title">Post Job</span>
                                <span className="sidebar-action-desc">Create and publish a new job</span>
                            </span>
                        </button>

                        <button
                            type="button"
                            className="recruiter-sidebar-action"
                            onClick={() => navigate('/recruiter/search-candidates')}
                        >
                            <span className="sidebar-action-icon">🔍</span>
                            <span className="sidebar-action-content">
                                <span className="sidebar-action-title">Search Candidates</span>
                                <span className="sidebar-action-desc">Search applicants for your jobs</span>
                            </span>
                        </button>

                        <button
                            type="button"
                            className="recruiter-sidebar-action"
                            onClick={() => navigate('/recruiter/candidates')}
                        >
                            <span className="sidebar-action-icon">👥</span>
                            <span className="sidebar-action-content">
                                <span className="sidebar-action-title">View All Candidates</span>
                                <span className="sidebar-action-desc">Browse applicants and resumes</span>
                            </span>
                        </button>
                    </div>
                </aside>

                <div className="recruiter-main">
                    <div className="recruiter-stats-section">
                        <div className="recruiter-stats-header">
                            <h2>Overview</h2>
                            <button
                                type="button"
                                className="recruiter-refresh-btn"
                                onClick={() => window.location.reload()}
                                disabled={statsLoading}
                            >
                                {statsLoading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>

                        {statsError && <div className="recruiter-stats-error">{statsError}</div>}

                        <div className="recruiter-stats-grid">
                            <div className="recruiter-stat-card">
                                <div className="stat-label">Total Jobs</div>
                                <div className="stat-value">{formatNumber(stats?.totalJobs)}</div>
                            </div>
                            <div className="recruiter-stat-card">
                                <div className="stat-label">Open Jobs</div>
                                <div className="stat-value">{formatNumber(stats?.openJobs)}</div>
                            </div>
                            <div className="recruiter-stat-card">
                                <div className="stat-label">Total Applicants</div>
                                <div className="stat-value">{formatNumber(stats?.totalApplicants)}</div>
                            </div>
                            <div className="recruiter-stat-card">
                                <div className="stat-label">Applicants (7 days)</div>
                                <div className="stat-value">{formatNumber(stats?.applicantsLast7Days)}</div>
                            </div>
                        </div>

                        <div className="recruiter-insights-grid">
                            <div className="recruiter-panel">
                                <div className="panel-title">Top Jobs by Applications</div>
                                {!stats?.topJobs?.length ? (
                                    <div className="panel-empty">No application data yet.</div>
                                ) : (
                                    <div className="panel-table">
                                        {stats.topJobs.map((j) => (
                                            <div key={String(j.jobId)} className="panel-row">
                                                <div className="panel-row-main">
                                                    <div className="panel-row-title">{j.title || 'Unknown'}</div>
                                                    <div className="panel-row-subtitle">{j.company || ''}</div>
                                                </div>
                                                <div className="panel-row-metric">{formatNumber(j.applications)}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="recruiter-panel">
                                <div className="panel-title">Recent Applicants</div>
                                {!stats?.recentApplicants?.length ? (
                                    <div className="panel-empty">No applicants yet.</div>
                                ) : (
                                    <div className="panel-table">
                                        {stats.recentApplicants.map((a) => (
                                            <div key={a._id} className="panel-row applicant-row">
                                                <div className="panel-row-main">
                                                    <div className="panel-row-title">{a.fullName || 'Unknown'}</div>
                                                    <div className="panel-row-subtitle">
                                                        {(a.jobTitle || '—') + (a.company ? ` @ ${a.company}` : '')}
                                                    </div>
                                                    <div className="panel-row-meta">
                                                        {(a.email || '—') + (a.appliedAt ? ` • ${new Date(a.appliedAt).toLocaleString()}` : '')}
                                                    </div>
                                                </div>
                                                <div className="panel-row-actions">
                                                    {a.resumePath ? (
                                                        <a
                                                            className="resume-link"
                                                            href={`${API_BASE}${a.resumePath}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Resume
                                                        </a>
                                                    ) : (
                                                        <span className="resume-missing">No resume</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className="recruiter-secondary-btn"
                                    onClick={() => navigate('/recruiter/candidates')}
                                >
                                    View all applicants
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;

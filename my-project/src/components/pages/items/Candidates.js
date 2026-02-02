// src/components/pages/items/Candidates.js – View All Candidates + Search
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Candidates.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Candidates = () => {
    const [user, setUser] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const userType = localStorage.getItem('userType');
        if (userData && userType === 'recruiter') {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchCandidates = async (isSearch = false, pageNum = 1) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setLoading(true);
        setError('');
        try {
            const url = isSearch && searchQuery.trim()
                ? `${API_BASE}/api/recruiter/candidates/search?q=${encodeURIComponent(searchQuery.trim())}&page=${pageNum}&limit=10`
                : `${API_BASE}/api/recruiter/candidates?page=${pageNum}&limit=10`;
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setCandidates(data.data || []);
                setPagination(data.pagination || { total: 0, pages: 1 });
                setPage(pageNum);
            } else {
                setError(data.message || 'Failed to load candidates');
                setCandidates([]);
            }
        } catch (err) {
            setError('Server error. Please try again.');
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchCandidates(!!searchQuery.trim(), 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only load when user is set
    }, [user]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCandidates(!!searchQuery.trim(), 1);
    };

    const getSkillsDisplay = (skills) => {
        if (!skills || !Array.isArray(skills)) return '—';
        const names = skills.map((s) => (typeof s === 'object' && s?.name ? s.name : s)).filter(Boolean);
        return names.length ? names.slice(0, 5).join(', ') : '—';
    };

    if (!user) return <div className="candidates-loading">Loading...</div>;

    return (
        <div className="candidates-page">
            <div className="candidates-header">
                <button className="candidates-back-btn" onClick={() => navigate('/recruiter-dashboard')}>
                    ← Back to Dashboard
                </button>
                <h1>View All Candidates</h1>
                <p>Browse and search student candidates.</p>
            </div>

            <form className="candidates-search-form" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search by name, email, skills, or profile..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="candidates-search-input"
                />
                <button type="submit" className="candidates-search-btn" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <div className="candidates-error">{error}</div>}

            {loading ? (
                <div className="candidates-loading-state">Loading candidates...</div>
            ) : candidates.length === 0 ? (
                <div className="candidates-empty">No candidates found.</div>
            ) : (
                <>
                    <div className="candidates-list">
                        {candidates.map((c) => (
                            <div key={c._id} className="candidate-card">
                                <div className="candidate-card-header">
                                    <div className="candidate-avatar">
                                        {(c.firstName?.[0] || '') + (c.lastName?.[0] || '') || '?'}
                                    </div>
                                    <div className="candidate-info">
                                        <h3>{[c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unknown'}</h3>
                                        <p className="candidate-email">{c.email || '—'}</p>
                                        {c.phone && <p className="candidate-phone">{c.phone}</p>}
                                    </div>
                                </div>
                                {(c.studentProfile?.headline || c.studentProfile?.summary) && (
                                    <p className="candidate-headline">
                                        {c.studentProfile.headline || c.studentProfile.summary?.substring(0, 120)}
                                        {c.studentProfile.summary?.length > 120 ? '...' : ''}
                                    </p>
                                )}
                                <div className="candidate-skills">
                                    <strong>Skills:</strong> {getSkillsDisplay(c.skills)}
                                </div>
                            </div>
                        ))}
                    </div>
                    {pagination.pages > 1 && (
                        <div className="candidates-pagination">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => fetchCandidates(!!searchQuery.trim(), page - 1)}
                            >
                                Previous
                            </button>
                            <span>
                                Page {page} of {pagination.pages} ({pagination.total} total)
                            </span>
                            <button
                                type="button"
                                disabled={page >= pagination.pages}
                                onClick={() => fetchCandidates(!!searchQuery.trim(), page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Candidates;

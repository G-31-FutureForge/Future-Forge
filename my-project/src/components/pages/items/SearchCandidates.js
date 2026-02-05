import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchCandidates.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SearchCandidates = () => {
    const [user, setUser] = useState(null);
    const [query, setQuery] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    const runSearch = async (e) => {
        e.preventDefault();

        const q = query.trim();
        if (!q) {
            setError('Please enter a search value.');
            setCandidates([]);
            setSearched(true);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const url = `${API_BASE}/api/recruiter/applied-candidates/search?q=${encodeURIComponent(q)}&page=1&limit=50`;
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || data.success === false) {
                throw new Error(data.message || 'Failed to search candidates');
            }

            setCandidates(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            setCandidates([]);
            setError(err.message || 'Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setQuery('');
        setCandidates([]);
        setSearched(false);
        setError('');
    };

    if (!user) return <div className="search-candidates-loading">Loading...</div>;

    return (
        <div className="search-candidates-page">
            <div className="search-candidates-header">
                <button className="search-candidates-back-btn" onClick={() => navigate('/recruiter-dashboard')}>
                    ← Back to Dashboard
                </button>
                <h1>Search Candidates</h1>
                <p>Search applicants to your posted jobs by keyword, phrase, name, or email.</p>
            </div>

            <form className="search-candidates-form" onSubmit={runSearch}>
                <input
                    type="text"
                    className="search-candidates-input"
                    placeholder={'Try: john  |  "full stack"  |  email:john@mail.com  |  name:john'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={loading}
                />

                <button type="submit" className="search-candidates-btn" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>

                <button type="button" className="search-candidates-clear" onClick={clearResults} disabled={loading}>
                    Clear
                </button>
            </form>

            <div className="search-candidates-hint">
                Use quotes for phrase search. Optional prefixes: <strong>email:</strong> or <strong>name:</strong>
            </div>

            {error && <div className="search-candidates-error">{error}</div>}

            {!searched ? (
                <div className="search-candidates-empty">Enter a search and click Search to see results.</div>
            ) : loading ? (
                <div className="search-candidates-empty">Searching...</div>
            ) : candidates.length === 0 ? (
                <div className="search-candidates-empty">No candidates found.</div>
            ) : (
                <>
                    <div className="search-candidates-results-meta">Showing {candidates.length} result{candidates.length === 1 ? '' : 's'}</div>
                    <div className="search-candidates-list">
                        {candidates.map((c) => (
                            <div key={c._id} className="search-candidate-card">
                                <div className="search-candidate-card-header">
                                    <div className="search-candidate-avatar">{c.fullName?.[0] || '?'}</div>
                                    <div className="search-candidate-info">
                                        <h3>{c.fullName || 'Unknown'}</h3>
                                        <p className="search-candidate-email">{c.email || '—'}</p>
                                        {c.phone && <p className="search-candidate-phone">{c.phone}</p>}
                                    </div>
                                </div>
                                <div className="search-candidate-row">
                                    <strong>Applied For:</strong> {c.jobTitle || '—'} {c.company ? `@ ${c.company}` : ''}
                                </div>
                                <div className="search-candidate-row">
                                    <strong>Applied At:</strong> {c.appliedAt ? new Date(c.appliedAt).toLocaleString() : '—'}
                                </div>
                                {c.resumePath && (
                                    <div className="search-candidate-row">
                                        <strong>Resume:</strong>{' '}
                                        <a href={`${API_BASE}${c.resumePath}`} target="_blank" rel="noreferrer">
                                            View
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SearchCandidates;

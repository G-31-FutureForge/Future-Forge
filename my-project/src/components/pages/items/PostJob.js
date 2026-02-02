// src/components/pages/items/PostJob.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostJob.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PostJob = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        description: '',
        skills: '',
        requirements: '',
        salary: '',
        jobType: 'Full-time',
        applicationDeadline: '',
    });
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please log in again.');
            setLoading(false);
            return;
        }

        try {
            const skillsArray = formData.skills
                ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
                : [];
            const requirementsArray = formData.requirements
                ? formData.requirements.split(',').map((r) => r.trim()).filter(Boolean)
                : [];

            const response = await fetch(`${API_BASE}/api/recruiter/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: formData.title,
                    company: formData.company,
                    location: formData.location,
                    description: formData.description,
                    skills: skillsArray,
                    requirements: requirementsArray,
                    salary: formData.salary || undefined,
                    jobType: formData.jobType,
                    applicationDeadline: formData.applicationDeadline || undefined,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/recruiter-dashboard');
            } else {
                setError(data.message || 'Failed to post job');
            }
        } catch (err) {
            setError('Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="post-job-loading">Loading...</div>;

    return (
        <div className="post-job-page">
            <div className="post-job-header">
                <button className="back-btn" onClick={() => navigate('/recruiter-dashboard')}>
                    ← Back to Dashboard
                </button>
                <h1>Post a New Job</h1>
                <p>Fill in the details to create a job posting.</p>
            </div>

            <form className="post-job-form" onSubmit={handleSubmit}>
                {error && <div className="post-job-error">{error}</div>}

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="title">Job Title *</label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Senior React Developer"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="company">Company Name *</label>
                        <input
                            id="company"
                            name="company"
                            type="text"
                            value={formData.company}
                            onChange={handleChange}
                            required
                            placeholder="Your company name"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="location">Location *</label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Remote, Mumbai, Bangalore"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="jobType">Job Type *</label>
                        <select
                            id="jobType"
                            name="jobType"
                            value={formData.jobType}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Job Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Describe the role and responsibilities..."
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="skills">Skills (comma-separated)</label>
                    <input
                        id="skills"
                        name="skills"
                        type="text"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="e.g. React, Node.js, MongoDB"
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="requirements">Requirements (comma-separated)</label>
                    <input
                        id="requirements"
                        name="requirements"
                        type="text"
                        value={formData.requirements}
                        onChange={handleChange}
                        placeholder="e.g. 3+ years experience, B.Tech"
                        disabled={loading}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="salary">Salary (optional)</label>
                        <input
                            id="salary"
                            name="salary"
                            type="text"
                            value={formData.salary}
                            onChange={handleChange}
                            placeholder="e.g. 10-15 LPA"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="applicationDeadline">Application Deadline (optional)</label>
                        <input
                            id="applicationDeadline"
                            name="applicationDeadline"
                            type="date"
                            value={formData.applicationDeadline}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => navigate('/recruiter-dashboard')} disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Posting...' : 'Post Job'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostJob;

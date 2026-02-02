// src/components/pages/items/JobDetails.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './JobDetails.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyForm, setApplyForm] = useState({
    resume: '',
    coverLetter: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/job-posts/${jobId}`);
      
      if (response.data.success) {
        setJob(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching job details');
      console.error('Fetch job error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFormChange = (e) => {
    const { name, value } = e.target;
    setApplyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (userType !== 'student') {
      setError('Only students can apply for jobs');
      return;
    }

    try {
      setApplying(true);
      setError('');

      const response = await axios.post(
        `${API_URL}/job-posts/${jobId}/apply`,
        applyForm,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSuccessMessage('Application submitted successfully!');
        setShowApplyModal(false);
        setApplyForm({ resume: '', coverLetter: '' });
        
        setTimeout(() => {
          setSuccessMessage('');
          navigate('/job-finder');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting application');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (salary) => {
    if (!salary || !salary.min) return 'Not disclosed';
    if (salary.max) {
      return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()} ${salary.currency || 'USD'}/${salary.salaryType || 'annual'}`;
    }
    return `$${salary.min.toLocaleString()}+ ${salary.currency || 'USD'}/${salary.salaryType || 'annual'}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="job-details-loading">
        <div className="spinner"></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-details-error">
        <h2>Job not found</h2>
        <p>{error || 'This job posting may have been removed.'}</p>
        <button onClick={() => navigate('/job-finder')} className="back-btn">
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="job-details-container">
      {error && (
        <div className="error-alert">
          {error}
          <button onClick={() => setError('')} className="close-alert">✕</button>
        </div>
      )}

      {successMessage && (
        <div className="success-alert">
          {successMessage}
        </div>
      )}

      <button onClick={() => navigate('/job-finder')} className="back-to-jobs-btn">
        ← Back to Jobs
      </button>

      <div className="job-details-header">
        <div className="job-header-left">
          <h1 className="job-title">{job.title}</h1>
          <p className="company-name">{job.company?.name || 'Unknown Company'}</p>
          <div className="job-badges">
            <span className="badge job-type">{job.jobType}</span>
            <span className="badge level">{job.experienceLevel}</span>
            <span className="badge location-type">{job.locationType}</span>
          </div>
        </div>
        <div className="job-header-right">
          {token && userType === 'student' ? (
            <button 
              className="apply-btn"
              onClick={() => setShowApplyModal(true)}
            >
              Apply Now
            </button>
          ) : !token ? (
            <button 
              className="apply-btn"
              onClick={() => navigate('/login')}
            >
              Login to Apply
            </button>
          ) : (
            <p className="apply-info">Only students can apply for jobs</p>
          )}
        </div>
      </div>

      <div className="job-details-wrapper">
        {/* Main Content */}
        <main className="job-details-main">
          {/* Job Information Grid */}
          <section className="info-section">
            <h3>Job Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Location</label>
                <p>📍 {job.location}</p>
              </div>
              <div className="info-item">
                <label>Salary</label>
                <p>💰 {formatSalary(job.salary)}</p>
              </div>
              <div className="info-item">
                <label>Positions Available</label>
                <p>👥 {job.numberOfPositions || 1}</p>
              </div>
              <div className="info-item">
                <label>Posted Date</label>
                <p>📅 {formatDate(job.postedAt)}</p>
              </div>
              {job.applicationDeadline && (
                <div className="info-item">
                  <label>Application Deadline</label>
                  <p>⏰ {formatDate(job.applicationDeadline)}</p>
                </div>
              )}
              <div className="info-item">
                <label>Education Required</label>
                <p>🎓 {job.minEducation}</p>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="description-section">
            <h3>Job Description</h3>
            <p className="description-text">{job.description}</p>
          </section>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <section className="list-section">
              <h3>Responsibilities</h3>
              <ul className="list">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Required Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <section className="list-section">
              <h3>Required Skills</h3>
              <div className="skills-list">
                {job.requiredSkills.map((skill, idx) => (
                  <div key={idx} className="skill-item">
                    <span className="skill-name">{skill.skill}</span>
                    <span className="skill-level">{skill.level}</span>
                    {skill.yearsRequired && (
                      <span className="skill-years">{skill.yearsRequired}+ years</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Preferred Skills */}
          {job.preferredSkills && job.preferredSkills.length > 0 && (
            <section className="list-section">
              <h3>Preferred Skills</h3>
              <div className="skills-list">
                {job.preferredSkills.map((skill, idx) => (
                  <div key={idx} className="skill-item">
                    <span className="skill-name">{skill.skill}</span>
                    <span className="skill-level">{skill.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Qualifications */}
          {job.qualifications && job.qualifications.length > 0 && (
            <section className="list-section">
              <h3>Qualifications</h3>
              <ul className="list">
                {job.qualifications.map((qual, idx) => (
                  <li key={idx}>{qual}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <section className="list-section">
              <h3>Benefits</h3>
              <ul className="list benefits-list">
                {job.benefits.map((benefit, idx) => (
                  <li key={idx}>✓ {benefit}</li>
                ))}
              </ul>
            </section>
          )}
        </main>

        {/* Sidebar */}
        <aside className="job-details-sidebar">
          <div className="sidebar-card">
            <h4>About {job.company?.name || 'Company'}</h4>
            {job.company?.website && (
              <p>
                <a href={job.company.website} target="_blank" rel="noopener noreferrer">
                  Visit Company Website ↗
                </a>
              </p>
            )}
            {job.company?.description && (
              <p className="company-description">{job.company.description}</p>
            )}
          </div>

          <div className="sidebar-card">
            <h4>Contact</h4>
            {job.company?.email && (
              <p>📧 {job.company.email}</p>
            )}
            {job.company?.phone && (
              <p>📱 {job.company.phone}</p>
            )}
          </div>

          <div className="sidebar-card">
            <h4>Quick Stats</h4>
            <p>👁️ Views: {job.viewCount || 0}</p>
            <p>📝 Total Applications: {job.totalApplications || 0}</p>
          </div>

          {token && userType === 'student' && (
            <button 
              className="apply-btn-sidebar"
              onClick={() => setShowApplyModal(true)}
            >
              Apply Now
            </button>
          )}
        </aside>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply for {job.title}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowApplyModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="apply-form">
              <div className="form-group">
                <label>Resume URL *</label>
                <input
                  type="text"
                  name="resume"
                  placeholder="https://example.com/your-resume.pdf"
                  value={applyForm.resume}
                  onChange={handleApplyFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Cover Letter</label>
                <textarea
                  name="coverLetter"
                  placeholder="Tell us why you're interested in this position..."
                  value={applyForm.coverLetter}
                  onChange={handleApplyFormChange}
                  rows="6"
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowApplyModal(false)}
                  disabled={applying}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="submit-btn"
                  disabled={applying}
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;

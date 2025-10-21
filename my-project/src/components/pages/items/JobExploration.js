import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './JobExploration.css';
import { jobsData } from '../../../data/jobsData';

const JobExploration = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrapeSource, setScrapeSource] = useState(null); // 'live' or 'fallback'
  const [error] = useState(null);
  const [selectedQualification, setSelectedQualification] = useState('all');
  const [resume, setResume] = useState(null);
  const [resumeError, setResumeError] = useState('');

  useEffect(() => {
    if (selectedQualification === '10th') {
      setLoading(true);
      fetch(`http://localhost:5000/api/scrape/sarkari-result?qualification=${selectedQualification}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(response => {
          console.log('Raw server response:', response); // Debug log
          // Expecting { success, source, count, jobs, error }
          const jobsArray = Array.isArray(response) ? response : (response.jobs || []);
          const scrapedJobs = jobsArray.map(job => ({
            _id: job.link,
            title: job.title,
            company: 'Sarkari Result',
            requiredQualification: job.qualification || '10th',
            location: 'India',
            jobType: 'Govt',
            salary: 'N/A',
            description: `See details on Sarkari Result.`,
            skills: [],
            postedDate: job.postDate || new Date().toISOString(),
            applicationDeadline: new Date(Date.now() + 15*24*60*60*1000).toISOString(),
            link: job.link
          }));
          setScrapeSource(response.source || null);
          setJobs(scrapedJobs);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching jobs:', err);
          setJobs([]);
          setScrapeSource(null);
          setLoading(false);
        });
    } else {
      // Simulate API call with dummy data
      const loadDummyData = () => {
        try {
          setTimeout(() => {
            // Filter jobs based on qualification
            const filteredJobs = selectedQualification === 'all' 
              ? jobsData 
              : jobsData.filter(job => job.requiredQualification === selectedQualification);
            setJobs(filteredJobs);
            setLoading(false);
          }, 1000);
        } catch (err) {
          console.error('Error loading jobs:', err);
        }
      };

      loadDummyData();
    }
  }, [selectedQualification]);

  const handleQualificationChange = (qualification) => {
    setSelectedQualification(qualification);
    setLoading(true);
  };

  const handleResumeUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        if (file.size <= 5 * 1024 * 1024) { // 5MB limit
          setResume(file);
          setResumeError('');
        } else {
          setResumeError('Resume file size should be less than 5MB');
        }
      } else {
        setResumeError('Please upload a PDF file');
      }
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="job-exploration-page">
      <div className="job-exploration-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Job Exploration</h1>
      </div>
      <div className="job-exploration-content">
        <div className="filters-section">
          <div className="qualification-filters">
            <h2>Select Your Qualification</h2>
            <div className="qualification-buttons">
              <button 
                className={`qual-btn ${selectedQualification === '10th' ? 'active' : ''}`}
                onClick={() => handleQualificationChange('10th')}
              >
                10th Pass
              </button>
              <button 
                className={`qual-btn ${selectedQualification === '12th' ? 'active' : ''}`}
                onClick={() => handleQualificationChange('12th')}
              >
                12th Pass
              </button>
              <button 
                className={`qual-btn ${selectedQualification === 'graduate' ? 'active' : ''}`}
                onClick={() => handleQualificationChange('graduate')}
              >
                Graduate
              </button>
            </div>
          </div>
          {/* Show resume upload only for graduate */}
          {selectedQualification === 'graduate' && (
            <div className="resume-upload-section">
              <h2>Upload Your Resume</h2>
              <div className="resume-upload-container">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="resume-input"
                />
                <label htmlFor="resume-upload" className="resume-label">
                  {resume ? resume.name : 'Choose PDF file'}
                </label>
                {resumeError && <p className="resume-error">{resumeError}</p>}
                {resume && !resumeError && (
                  <p className="resume-success">Resume uploaded successfully!</p>
                )}
              </div>
              <p className="resume-hint">Max file size: 5MB, PDF format only</p>
            </div>
          )}
        </div>
        <div className="jobs-section">
          <h2>Available Positions</h2>
          {scrapeSource === 'fallback' && (
            <div className="scrape-banner">
              <strong>Note:</strong> Live scraping is currently unavailable. Showing sample jobs instead.
            </div>
          )}
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job._id} className="job-card">
                <h3>{job.title}</h3>
                <p className="company">{job.company}</p>
                <p className="qualification">Required: {job.requiredQualification} Pass</p>
                <p className="location">📍 {job.location}</p>
                <p className="job-type">💼 {job.jobType}</p>
                <p className="salary">💰 {job.salary}</p>
                <p className="description">{job.description}</p>
                <div className="skills">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
                <div className="dates">
                  <p className="posted-date">Posted: {new Date(job.postedDate).toLocaleDateString()}</p>
                  <p className="deadline">Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</p>
                </div>
                <button 
                  className="apply-btn" 
                  disabled={selectedQualification === 'graduate' && !resume}
                  title={selectedQualification === 'graduate' && !resume ? 'Please upload your resume first' : ''}
                  onClick={() => job.link ? window.open(job.link, '_blank') : null}
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobExploration;
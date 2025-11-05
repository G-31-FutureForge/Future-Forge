import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './JobExploration.css';
import { jobsData } from '../../../data/jobsData';

const JobCard = ({ job, selectedQualification, resume, handleApply }) => {
  return (
    <div key={job._id} className="job-card">
      <div className="job-card-header">
        <div className="job-title-container">
          <h3 className="job-title">{job.title}</h3>
          <div className="job-badges">
            <span className={`job-badge ${job.jobType.toLowerCase().replace(' ', '-')}`}>{job.jobType}</span>
            <span className={`source-badge ${job.source.toLowerCase().replace(' ', '-')}`}>{job.source}</span>
          </div>
        </div>
      </div>
      
      <div className="job-company">
        <span className="company-icon">🏢</span>
        {job.company}
      </div>

      <div className="job-details">
        <div className="job-detail">
          <span className="detail-icon">🎓</span>
          <span>Required: {job.requiredQualification}</span>
        </div>
        <div className="job-detail">
          <span className="detail-icon">📍</span>
          <span>{job.location}</span>
        </div>
        <div className="job-detail">
          <span className="detail-icon">💰</span>
          <span>{job.salary}</span>
        </div>
      </div>

      <p className="job-description">{job.description}</p>

      {job.skills && job.skills.length > 0 && (
        <div className="skills-section">
          <h4>Skills Required:</h4>
          <div className="skills">
            {job.skills.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}

      <div className="job-dates">
        <div className="date-info">
          <span className="date-label">Posted:</span>
          <span>{new Date(job.postedDate).toLocaleDateString()}</span>
        </div>
        {job.applicationDeadline && (
          <div className="date-info">
            <span className="date-label">Deadline:</span>
            <span>{new Date(job.applicationDeadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <button 
        className={`apply-btn ${selectedQualification === 'graduate' && !resume ? 'disabled' : ''}`}
        disabled={selectedQualification === 'graduate' && !resume}
        title={selectedQualification === 'graduate' && !resume ? 'Please upload your resume first' : 'Apply for this position'}
        onClick={() => handleApply(job)}
      >
        {selectedQualification === 'graduate' && !resume ? 'Upload Resume to Apply' : 'Apply Now'}
      </button>
    </div>
  );
};

const JobExploration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrapeSource, setScrapeSource] = useState(null);
  const [error, setError] = useState(null);
  const [selectedQualification, setSelectedQualification] = useState('all');
  const [resume, setResume] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all'); // all | government | private

  // Load jobs based on qualification and search
  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        await fetchAllJobs();
      } catch (err) {
        console.error('Error loading jobs:', err);
        setError('Failed to load jobs. Please try again.');
        setLoading(false);
      }
    };

    loadJobs();
  }, [selectedQualification, searchQuery]);

  // Filter jobs when search query changes
  useEffect(() => {
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
      filterJobs(location.state.searchQuery);
    } else {
      setSearchQuery('');
      setFilteredJobs(jobs);
    }
  }, [location.state, jobs]);

  const fetchJoobleJobs = async () => {
    try {
      const params = new URLSearchParams({
        keywords: searchQuery || '',
        qualification: selectedQualification,
        location: 'India',
        page: '1',
        radius: '25'
      });
      const response = await fetch(`http://localhost:5000/api/jobs/explore?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
      return jobs.map(job => ({
        _id: job._id || job.id || Math.random().toString(36).substr(2, 9),
        title: job.title,
        company: job.company || 'Company not specified',
        requiredQualification: job.requiredQualification || selectedQualification || 'all',
        location: job.location || 'Location not specified',
        // Force sector for Jooble jobs so UI sections work
        jobType: 'Private Sector',
        salary: job.salary || 'Not specified',
        description: job.description || 'No description available',
        skills: Array.isArray(job.skills) ? job.skills : [],
        postedDate: job.postedDate || job.updated || new Date().toISOString(),
        applicationDeadline: job.applicationDeadline || null,
        link: job.link || '#',
        source: job.source || 'Jooble'
      }));
    } catch (err) {
      console.error('Error fetching Jooble jobs:', err);
      return [];
    }
  };

  const fetchSarkariResultJobs = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/scrape/sarkari-result?qualification=${selectedQualification === 'all' ? '' : selectedQualification}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw server response:', data);

      const jobsArray = Array.isArray(data) ? data : (data.jobs || []);
      const scrapedJobs = jobsArray.map(job => {
        const qualification = job.qualification || 'all';
        const skillsSet = ['Government Job'];
        if (qualification !== 'all') {
          skillsSet.push(`${qualification} Pass`);
        }

        return {
          _id: job.link || Math.random().toString(36).substr(2, 9),
          title: job.title || 'Government Job',
          company: 'Sarkari Result',
          requiredQualification: qualification,
          location: 'India',
          jobType: 'Government',
          salary: 'As per government norms',
          description: job.description || `See details on Sarkari Result website.`,
          skills: skillsSet,
          postedDate: job.postDate || new Date().toISOString(),
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          link: job.link || '#',
          source: 'Sarkari Result'
        };
      });

      return scrapedJobs;
    } catch (err) {
      console.error('Error fetching Sarkari Result jobs:', err);
      return [];
    }
  };

  const fetchAllJobs = async () => {
    try {
      const [joobleJobs, sarkariJobs] = await Promise.all([
        fetchJoobleJobs(),
        fetchSarkariResultJobs()
      ]);

      let allJobs = [...joobleJobs, ...sarkariJobs];

      // Filter jobs based on selectedQualification if not 'all'
      if (selectedQualification !== 'all') {
        allJobs = allJobs.filter(job => 
          job.requiredQualification === selectedQualification || 
          job.requiredQualification === 'all'
        );
      }

      // If there is a search query, only show searched results
      let nextFiltered = allJobs;
      if (searchQuery && searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase();
        nextFiltered = allJobs.filter(job =>
          job.title?.toLowerCase().includes(searchTerm) ||
          job.company?.toLowerCase().includes(searchTerm) ||
          job.description?.toLowerCase().includes(searchTerm) ||
          job.location?.toLowerCase().includes(searchTerm) ||
          (Array.isArray(job.skills) && job.skills.some(skill => skill.toLowerCase().includes(searchTerm)))
        );
      }

      setScrapeSource('live');
      setJobs(allJobs);
      setFilteredJobs(nextFiltered);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      await loadDummyData();
      setScrapeSource('fallback');
    }
  };

  const loadDummyData = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const filteredJobs = selectedQualification === 'all' 
            ? jobsData 
            : jobsData.filter(job => job.requiredQualification === selectedQualification);
          
          setJobs(filteredJobs);
          setFilteredJobs(filteredJobs);
          setLoading(false);
          resolve();
        } catch (err) {
          console.error('Error loading dummy data:', err);
          setError('Failed to load jobs data.');
          setLoading(false);
          resolve();
        }
      }, 1000);
    });
  };

  const filterJobs = (query) => {
    if (!query.trim()) {
      setFilteredJobs(jobs);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = jobs.filter(job => 
      job.title.toLowerCase().includes(searchTerm) ||
      job.company.toLowerCase().includes(searchTerm) ||
      job.description.toLowerCase().includes(searchTerm) ||
      job.location.toLowerCase().includes(searchTerm) ||
      (job.skills && job.skills.some(skill => 
        skill.toLowerCase().includes(searchTerm)
      ))
    );
    setFilteredJobs(filtered);
  };

  const handleQualificationChange = (qualification) => {
    setSelectedQualification(qualification);
    setSearchQuery('');
    setLoading(true);
    // Clear location state to remove search filter
    navigate('/jobs-exploration', { replace: true });
  };

  const handleSectorChange = (sector) => {
    // toggle off when clicking the same sector to show all
    setSectorFilter(prev => (prev === sector ? 'all' : sector));
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

  const handleApply = (job) => {
    if (selectedQualification === 'graduate' && !resume) {
      alert('Please upload your resume before applying for graduate positions.');
      return;
    }

    if (job.link && job.link !== '#') {
      window.open(job.link, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Application process for ${job.title} at ${job.company} would start here.`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredJobs(jobs);
    navigate('/jobs-exploration', { replace: true });
  };

  const getJobCountText = () => {
    if (searchQuery) {
      return `Found ${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} for "${searchQuery}"`;
    }
    return `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} available`;
  };

  if (loading) {
    return (
      <div className="job-exploration-page">
        <div className="job-exploration-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>Job Exploration</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-exploration-page">
        <div className="job-exploration-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>Job Exploration</h1>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Jobs</h3>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-exploration-page">
      <div className="job-exploration-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Job Exploration</h1>
        {searchQuery && (
          <div className="search-results-info">
            <div className="search-info">
              <p>{getJobCountText()}</p>
              <button 
                className="clear-search-btn"
                onClick={clearSearch}
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="job-exploration-content">
        <div className="filters-section">
          <div className="qualification-filters">
            <h2>Select Your Qualification</h2>
            <p className="filter-description">
              Choose your qualification level to see relevant job opportunities
            </p>
            <div className="qualification-buttons">
              <button 
                className={`qual-btn ${selectedQualification === '10th' ? 'active' : ''}`}
                onClick={() => handleQualificationChange('10th')}
              >
                🎓 10th Pass
              </button>
              <button 
                className={`qual-btn ${selectedQualification === '12th' ? 'active' : ''}`}
                onClick={() => handleQualificationChange('12th')}
              >
                🎓 12th Pass
              </button>
              <button 
                className={`qual-btn ${selectedQualification === 'graduate' ? 'active' : ''}`}
                onClick={() => handleQualificationChange('graduate')}
              >
                🎓 Graduate
              </button>
              <button 
                className={`qual-btn ${selectedQualification === 'all' ? 'active' : ''}`}
                onClick={() => handleQualificationChange('all')}
              >
                🌟 All Jobs
              </button>
            </div>

            <h2 style={{ marginTop: '1.5rem' }}>Filter by Sector</h2>
            <p className="filter-description">Quickly switch between Government and Private jobs</p>
            <div className="qualification-buttons">
              <button
                className={`qual-btn ${sectorFilter === 'government' ? 'active' : ''}`}
                onClick={() => handleSectorChange('government')}
              >
                🏛️ Government
              </button>
              <button
                className={`qual-btn ${sectorFilter === 'private' ? 'active' : ''}`}
                onClick={() => handleSectorChange('private')}
              >
                🏢 Private
              </button>
            </div>
          </div>

          {/* Resume Upload Section - Only for Graduate */}
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
                  {resume ? (
                    <>
                      <span className="file-icon">📄</span>
                      {resume.name}
                    </>
                  ) : (
                    <>
                      <span className="file-icon">📁</span>
                      Choose PDF file
                    </>
                  )}
                </label>
                {resumeError && (
                  <p className="resume-error">⚠️ {resumeError}</p>
                )}
                {resume && !resumeError && (
                  <p className="resume-success">✅ Resume uploaded successfully!</p>
                )}
              </div>
              <p className="resume-hint">Max file size: 5MB, PDF format only</p>
            </div>
          )}
        </div>

        <div className="jobs-section">
          <div className="jobs-header">
            <h2>Available Positions</h2>
            <div className="jobs-count">
              {getJobCountText()}
              {scrapeSource === 'fallback' && (
                <span className="scrape-notice"> (Sample Data)</span>
              )}
            </div>
          </div>

          {scrapeSource === 'fallback' && (
            <div className="scrape-banner">
              <strong>Note:</strong> Live scraping is currently unavailable. Showing sample jobs for demonstration.
            </div>
          )}

          {filteredJobs.length === 0 ? (
            <div className="no-jobs-found">
              <div className="no-jobs-icon">🔍</div>
              <h3>No jobs found</h3>
              <p>
                {searchQuery 
                  ? `No jobs found for "${searchQuery}". Try adjusting your search terms or browse all jobs.`
                  : `No jobs available for ${selectedQualification} qualification. Try selecting a different qualification level.`
                }
              </p>
              {searchQuery && (
                <button 
                  className="browse-all-btn"
                  onClick={clearSearch}
                >
                  Browse All Jobs
                </button>
              )}
            </div>
          ) : (
            <div className="jobs-sections">
              {/* Government Jobs Section */}
              {(sectorFilter === 'all' || sectorFilter === 'government') && (
              <div className="jobs-section-category">
                <div className="section-header">
                  <h3>
                    <span className="section-icon">🏛️</span>
                    Government Jobs
                  </h3>
                  <span className="section-count">
                    {filteredJobs.filter(job => job.jobType === 'Government').length} positions
                  </span>
                </div>
                <div className="jobs-grid">
                  {filteredJobs
                    .filter(job => job.jobType === 'Government')
                    .map((job) => (
                      <JobCard 
                        key={job._id}
                        job={job}
                        selectedQualification={selectedQualification}
                        resume={resume}
                        handleApply={handleApply}
                      />
                    ))}
                </div>
              </div>
              )}

              {/* Private Sector Jobs Section */}
              {(sectorFilter === 'all' || sectorFilter === 'private') && (
              <div className="jobs-section-category">
                <div className="section-header">
                  <h3>
                    <span className="section-icon">🏢</span>
                    Private Sector Jobs
                  </h3>
                  <span className="section-count">
                    {filteredJobs.filter(job => job.jobType === 'Private Sector').length} positions
                  </span>
                </div>
                <div className="jobs-grid">
                  {filteredJobs
                    .filter(job => job.jobType === 'Private Sector')
                    .map((job) => (
                      <JobCard 
                        key={job._id}
                        job={job}
                        selectedQualification={selectedQualification}
                        resume={resume}
                        handleApply={handleApply}
                      />
                    ))}
                </div>
              </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobExploration;
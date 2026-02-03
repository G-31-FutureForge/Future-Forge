import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './JobExploration.css';
import { jobsData } from '../../../data/jobsData';
import YouTubeModal from '../../common/YouTubeModal';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

const MatchedJobCard = ({ job, handleApply }) => {
  const matchData = job.matchData || {};
  const matchPercentage = matchData.matchPercentage || 0;
  const getMatchColor = (percentage) => {
    if (percentage >= 80) return '#2ecc71'; // Green
    if (percentage >= 60) return '#f39c12'; // Orange
    if (percentage >= 40) return '#e74c3c'; // Red
    return '#95a5a6'; // Gray
  };

  return (
    <div key={job._id} className="matched-job-card">
      <div className="match-score-badge" style={{ borderColor: getMatchColor(matchPercentage) }}>
        <div className="match-percentage" style={{ color: getMatchColor(matchPercentage) }}>
          {matchPercentage}%
        </div>
        <div className="match-label">Match</div>
      </div>

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

      {/* Show matched skills */}
      {matchData.matchedSkills && matchData.matchedSkills.length > 0 && (
        <div className="skills-section">
          <h4>Your Skills Match:</h4>
          <div className="skills">
            {matchData.matchedSkills.map((skill, index) => (
              <span key={index} className="skill-tag matched-skill">✓ {skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Show missing skills */}
      {matchData.missingSkills && matchData.missingSkills.length > 0 && (
        <div className="skills-section">
          <h4>Skills to Develop ({matchData.missingSkills.length}):</h4>
          <div className="skills">
            {matchData.missingSkills.map((skill, index) => (
              <span key={index} className="skill-tag missing-skill">○ {skill}</span>
            ))}
          </div>
        </div>
      )}

      <div className="match-stats">
        <div className="stat">
          <span className="stat-label">Matched Skills:</span>
          <span className="stat-value">{matchData.totalMatchedSkills}/{matchData.totalRequiredSkills}</span>
        </div>
      </div>

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
        className="apply-btn matched-apply"
        onClick={() => handleApply(job)}
        title="Apply for this position"
      >
        Apply Now
      </button>
    </div>
  );
};

const JobExploration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [futureForgeJobs, setFutureForgeJobs] = useState([]);
  const [futureForgeError, setFutureForgeError] = useState('');
  const [loading, setLoading] = useState(true);
  const [scrapeSource, setScrapeSource] = useState(null);
  const [error, setError] = useState(null);
  const [selectedQualification, setSelectedQualification] = useState('all');
  const [resume, setResume] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all'); // all | government | private
  const [sourceFilter, setSourceFilter] = useState('all'); // all | future-forge
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [isMatchingResume, setIsMatchingResume] = useState(false);
  const [matchStats, setMatchStats] = useState(null);

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

  // If Future Forge filter is active, refresh recruiter jobs directly
  useEffect(() => {
    const refreshFutureForgeJobs = async () => {
      if (sourceFilter !== 'future-forge') return;
      try {
        const recruiterJobs = await fetchRecruiterPostedJobs();
        setFutureForgeJobs(recruiterJobs);
      } catch (e) {
        console.error('Error refreshing Future Forge jobs:', e);
      }
    };
    refreshFutureForgeJobs();
  }, [sourceFilter]);

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
      const response = await fetch(`${API_BASE}/api/job-exploration/explore?${params.toString()}`);
      
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
      const response = await fetch(`${API_BASE}/api/scrape/sarkari-result?qualification=${selectedQualification === 'all' ? '' : selectedQualification}`);
      
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

  const fetchRecruiterPostedJobs = async () => {
    try {
      // Use relative URL so CRA `proxy` can forward to backend (avoids CORS issues)
      const url = `/api/jobs/recruiter-posted?limit=100`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Recruiter jobs API error ${response.status}: ${errText || 'Request failed'}`);
      }

      const data = await response.json();
      const jobs = Array.isArray(data?.data) ? data.data : [];

      const formatSalary = (job) => {
        // `salary` can be a string or object (mongoose Mixed). Prefer string for display.
        if (typeof job?.salary === 'string' && job.salary.trim()) return job.salary;
        // If salary is a number, show as-is.
        if (typeof job?.salary === 'number' && Number.isFinite(job.salary)) return String(job.salary);
        const min = job?.salaryRange?.min;
        const max = job?.salaryRange?.max;
        const currency = job?.salaryRange?.currency || '';
        if (min != null && max != null) return `${min} - ${max}${currency ? ` ${currency}` : ''}`;
        return 'Not specified';
      };

      return jobs.map(job => ({
        _id: job._id || Math.random().toString(36).substr(2, 9),
        title: job.title || '',
        company: job.company || 'Company not specified',
        requiredQualification: 'all', // Recruiter jobs visible to all candidates in Private Jobs
        location: job.location || 'Location not specified',
        jobType: 'Private Sector', // Recruiter jobs appear in Private Sector / Private Jobs section
        salary: formatSalary(job),
        description: job.description || 'No description available',
        skills: Array.isArray(job.skills) ? job.skills : [],
        postedDate: job.postedDate || new Date().toISOString(),
        applicationDeadline: job.applicationDeadline || null,
        source: 'Future Forge Recruiter',
        level: job.level || 'Mid-level'
      }));
    } catch (err) {
      console.error('Error fetching recruiter posted jobs:', err);
      setFutureForgeError(err?.message || 'Failed to fetch Future Forge jobs');
      return [];
    }
  };

  const fetchAllJobs = async () => {
    try {
      setFutureForgeError('');
      const [joobleJobs, sarkariJobs, recruiterJobs] = await Promise.all([
        fetchJoobleJobs(),
        fetchSarkariResultJobs(),
        fetchRecruiterPostedJobs()
      ]);

      let allJobs = [...recruiterJobs, ...joobleJobs, ...sarkariJobs];
      setFutureForgeJobs(recruiterJobs);

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

  const handleFutureForgeToggle = () => {
    setSourceFilter((prev) => {
      const next = prev === 'future-forge' ? 'all' : 'future-forge';
      if (next === 'future-forge') {
        // Make sure user sees the private section (where recruiter jobs live)
        setSectorFilter('private');
      }
      return next;
    });
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        if (file.size <= 5 * 1024 * 1024) { // 5MB limit
          setResume(file);
          setResumeError('');
          
          // Match resume with private sector jobs
          await matchResumeWithPrivateJobs(file);
        } else {
          setResumeError('Resume file size should be less than 5MB');
        }
      } else {
        setResumeError('Please upload a PDF file');
      }
    }
  };

  const matchResumeWithPrivateJobs = async (resumeFile) => {
    try {
      setIsMatchingResume(true);
      setResumeError('');
      
      // Get only private sector jobs with skills
      const privateJobs = filteredJobs.filter(
        job => job.jobType === 'Private Sector' && job.skills && job.skills.length > 0
      );

      if (privateJobs.length === 0) {
        console.log('No private sector jobs with skills found');
        setMatchedJobs([]);
        setMatchStats({ totalJobs: 0, matchedJobs: 0 });
        setIsMatchingResume(false);
        return;
      }

      console.log(`Matching resume with ${privateJobs.length} private sector jobs`);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobs', JSON.stringify(privateJobs));

      console.log('FormData prepared:', {
        resume: resumeFile.name,
        jobsCount: privateJobs.length
      });

      const response = await fetch(`${API_BASE}/api/match/resume-jobs`, {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const matchResult = await response.json();
      
      if (!matchResult.success) {
        console.error('Match result indicates failure:', matchResult);
        throw new Error(matchResult.error || 'Matching failed');
      }

      console.log('Match result:', matchResult);
      
      // Filter to only show jobs with at least one skill match
      const jobsWithMatches = matchResult.matchedJobs.filter(
        job => job.matchData?.matchedSkills?.length > 0
      );

      setMatchedJobs(jobsWithMatches);
      setMatchStats({
        totalJobs: matchResult.totalJobsProcessed,
        matchedJobs: jobsWithMatches.length,
        resumeSkills: matchResult.resumeSkills
      });

      console.log(`✅ Found ${jobsWithMatches.length} jobs matching your resume skills`);
    } catch (err) {
      console.error('Error matching resume:', err);
      setResumeError(err.message || 'Error processing resume. Please ensure your PDF contains readable text and try again.');
      setMatchedJobs([]);
      setMatchStats(null);
    } finally {
      setIsMatchingResume(false);
    }
  };

  const handleApply = (job) => {
    if (selectedQualification === 'graduate' && !resume) {
      alert('Please upload your resume before applying for graduate positions.');
      return;
    }

    if (job.link && job.link !== '#') {
      const link = (job.link || '').toString();
      const isYouTube = link.includes('youtube.com') || link.includes('youtu.be');
      if (isYouTube) {
        setVideoUrl(link);
      } else {
        window.open(link, '_blank', 'noopener,noreferrer');
      }
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

  const matchesCurrentFilters = (job) => {
    if (selectedQualification !== 'all') {
      if (job.requiredQualification !== selectedQualification && job.requiredQualification !== 'all') return false;
    }
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      const skillsText = Array.isArray(job.skills) ? job.skills.join(' ').toLowerCase() : '';
      const hit = (
        job.title?.toLowerCase().includes(searchTerm) ||
        job.company?.toLowerCase().includes(searchTerm) ||
        job.description?.toLowerCase().includes(searchTerm) ||
        job.location?.toLowerCase().includes(searchTerm) ||
        skillsText.includes(searchTerm)
      );
      if (!hit) return false;
    }
    return true;
  };

  const displayJobs = sourceFilter === 'future-forge'
    ? futureForgeJobs.filter(matchesCurrentFilters)
    : filteredJobs;

  const privateRecruiterJobs = displayJobs.filter(
    (job) => job.jobType === 'Private Sector' && job.source === 'Future Forge Recruiter'
  );
  const privateOtherJobs = displayJobs.filter(
    (job) => job.jobType === 'Private Sector' && job.source !== 'Future Forge Recruiter'
  );

  const getDisplayJobCountText = () => {
    if (searchQuery) {
      return `Found ${displayJobs.length} job${displayJobs.length !== 1 ? 's' : ''} for "${searchQuery}"`;
    }
    return `${displayJobs.length} job${displayJobs.length !== 1 ? 's' : ''} available`;
  };

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

            <h2 style={{ marginTop: '1.5rem' }}>Future Forge</h2>
            <p className="filter-description">Show jobs posted from the Recruiter Portal</p>
            <div className="qualification-buttons">
              <button
                className={`qual-btn ${sourceFilter === 'future-forge' ? 'active' : ''}`}
                onClick={handleFutureForgeToggle}
              >
                🚀 Future Forge
              </button>
            </div>
            {sourceFilter === 'future-forge' && futureForgeError && (
              <p className="resume-error" style={{ marginTop: '0.75rem' }}>
                ⚠️ {futureForgeError}
              </p>
            )}
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

          {/* Matched Jobs Section - Shows when resume is uploaded */}
          {selectedQualification === 'graduate' && matchedJobs.length > 0 && (
            <div className="matched-jobs-section">
              <h2>
                <span className="match-icon">⭐</span>
                Jobs Matching Your Skills
              </h2>
              <p className="match-section-description">
                Based on your resume, we found {matchStats?.matchedJobs} jobs that match your skills
              </p>
              <div className="matched-jobs-preview">
                {matchedJobs.slice(0, 3).map((job) => (
                  <div key={job._id} className="matched-job-preview">
                    <div className="preview-match-score">
                      <div className="score-circle" style={{ 
                        background: `conic-gradient(#2ecc71 0% ${job.matchData?.matchPercentage || 0}%, #ecf0f1 ${job.matchData?.matchPercentage || 0}% 100%)`
                      }}>
                        <span>{job.matchData?.matchPercentage || 0}%</span>
                      </div>
                    </div>
                    <div className="preview-job-info">
                      <h4>{job.title}</h4>
                      <p className="preview-company">{job.company}</p>
                      <p className="preview-location">📍 {job.location}</p>
                      {job.matchData?.matchedSkills?.length > 0 && (
                        <div className="preview-skills">
                          <small>Matched: {job.matchData.matchedSkills.slice(0, 2).join(', ')}{job.matchData.matchedSkills.length > 2 ? '...' : ''}</small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button className="view-all-matches-btn" onClick={() => setSectorFilter('private')}>
                View All Matches ({matchStats?.matchedJobs})
              </button>
            </div>
          )}

          {/* Loading indicator while matching */}
          {isMatchingResume && (
            <div className="matching-loader">
              <div className="loader-spinner"></div>
              <p>Analyzing your resume and matching with jobs...</p>
            </div>
          )}
        </div>

        <div className="jobs-section">
          <div className="jobs-header">
            <h2>Available Positions</h2>
            <div className="jobs-count">
              {getDisplayJobCountText()}
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

          {displayJobs.length === 0 ? (
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
                    {displayJobs.filter(job => job.jobType === 'Government').length} positions
                  </span>
                </div>
                <div className="jobs-grid">
                  {displayJobs
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
                    {resume && matchedJobs.length > 0 && (
                      <span className="badge-matched">Based on Your Resume</span>
                    )}
                  </h3>
                  <span className="section-count">
                    {resume && matchedJobs.length > 0 
                      ? `${matchedJobs.length} matches`
                      : `${displayJobs.filter(job => job.jobType === 'Private Sector').length} positions`
                    }
                  </span>
                </div>
                {resume && matchedJobs.length > 0 ? (
                  <div className="jobs-grid">
                    {matchedJobs.map((job) => (
                      <MatchedJobCard 
                        key={job._id}
                        job={job}
                        handleApply={handleApply}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="section-header" style={{ marginTop: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.05rem' }}>
                        <span className="section-icon">🔒</span>
                        Private Jobs
                      </h3>
                      <span className="section-count">
                        {privateRecruiterJobs.length} positions
                      </span>
                    </div>
                    <div className="jobs-grid">
                      {privateRecruiterJobs.map((job) => (
                        <JobCard 
                          key={job._id}
                          job={job}
                          selectedQualification={selectedQualification}
                          resume={resume}
                          handleApply={handleApply}
                        />
                      ))}
                    </div>

                    {sourceFilter !== 'future-forge' && (
                      <>
                        <div className="section-header" style={{ marginTop: '1rem' }}>
                          <h3 style={{ fontSize: '1.05rem' }}>
                            <span className="section-icon">🌐</span>
                            Public Private Jobs
                          </h3>
                          <span className="section-count">
                            {privateOtherJobs.length} positions
                          </span>
                        </div>
                        <div className="jobs-grid">
                          {privateOtherJobs.map((job) => (
                            <JobCard 
                              key={job._id}
                              job={job}
                              selectedQualification={selectedQualification}
                              resume={resume}
                              handleApply={handleApply}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
              )}
            </div>
          )}
        </div>
      </div>
      {videoUrl && (
        <YouTubeModal url={videoUrl} onClose={() => setVideoUrl(null)} />
      )}
    </div>
  );
};

export default JobExploration;
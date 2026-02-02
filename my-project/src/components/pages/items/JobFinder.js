// src/components/pages/items/JobFinder.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './JobFinder.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const JobFinder = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters state
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    locationType: '',
    minSalary: '',
    maxSalary: ''
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // Fetch jobs
  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', pagination.limit);
      
      if (filters.query) params.append('query', filters.query);
      if (filters.location) params.append('location', filters.location);
      if (filters.jobType) params.append('jobType', filters.jobType);
      if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
      if (filters.locationType) params.append('locationType', filters.locationType);
      if (filters.minSalary) params.append('minSalary', filters.minSalary);
      if (filters.maxSalary) params.append('maxSalary', filters.maxSalary);
      
      const response = await axios.get(`${API_URL}/job-posts/search/advanced?${params.toString()}`);
      
      if (response.data.success) {
        let jobPosts = response.data.data || [];
        let paginationInfo = response.data.pagination || { page, limit: pagination.limit, total: jobPosts.length, pages: 1 };

        // Also fetch local recruiter-created jobs (from legacy `Job` collection) and merge
        try {
          const localResp = await axios.get(`${API_URL}/jobs/local?page=${page}&limit=${pagination.limit}`);
          if (localResp.data && localResp.data.success) {
            const localJobs = localResp.data.jobs || [];
            // merge, dedupe by _id
            const map = new Map();
            [...jobPosts, ...localJobs].forEach(j => map.set(String(j._id), j));
            const merged = Array.from(map.values());
            jobPosts = merged;

            const localTotal = Number(localResp.data.totalCount || 0);
            const combinedTotal = Number(paginationInfo.total || 0) + localTotal;
            paginationInfo = {
              page: Number(page),
              limit: Number(pagination.limit),
              total: combinedTotal,
              pages: Math.max(1, Math.ceil(combinedTotal / Number(pagination.limit)))
            };
          }
        } catch (e) {
          // If local jobs fetch fails, continue showing job-posts only
          console.warn('Failed fetching local jobs:', e.message || e);
        }

        setJobs(jobPosts);
        setPagination(paginationInfo);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching jobs');
      console.error('Fetch jobs error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchJobs(1);
  }, []);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchJobs(1);
  };

  // Handle pagination
  const handlePagination = (newPage) => {
    fetchJobs(newPage);
  };

  // Format salary
  const formatSalary = (salary) => {
    if (!salary || !salary.min) return 'Not disclosed';
    if (salary.max) {
      return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()} ${salary.currency || 'USD'}/${salary.salaryType || 'annual'}`;
    }
    return `$${salary.min.toLocaleString()}+ ${salary.currency || 'USD'}/${salary.salaryType || 'annual'}`;
  };

  return (
    <div className="job-finder-container">
      <div className="job-finder-header">
        <h1>Find Your Dream Job</h1>
        <p>Discover job opportunities that match your skills and interests</p>
      </div>

      <div className="job-finder-wrapper">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            <button 
              className="reset-filters-btn"
              onClick={() => {
                setFilters({
                  query: '',
                  location: '',
                  jobType: '',
                  experienceLevel: '',
                  locationType: '',
                  minSalary: '',
                  maxSalary: ''
                });
              }}
            >
              Reset
            </button>
          </div>

          <form className="filters-form" onSubmit={handleSearch}>
            {/* Search Query */}
            <div className="filter-group">
              <label>Search Keywords</label>
              <input
                type="text"
                name="query"
                placeholder="Job title, skills..."
                value={filters.query}
                onChange={handleFilterChange}
              />
            </div>

            {/* Location */}
            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="City, Country..."
                value={filters.location}
                onChange={handleFilterChange}
              />
            </div>

            {/* Job Type */}
            <div className="filter-group">
              <label>Job Type</label>
              <select
                name="jobType"
                value={filters.jobType}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>

            {/* Experience Level */}
            <div className="filter-group">
              <label>Experience Level</label>
              <select
                name="experienceLevel"
                value={filters.experienceLevel}
                onChange={handleFilterChange}
              >
                <option value="">All Levels</option>
                <option value="Fresher">Fresher</option>
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            {/* Location Type */}
            <div className="filter-group">
              <label>Work Location</label>
              <select
                name="locationType"
                value={filters.locationType}
                onChange={handleFilterChange}
              >
                <option value="">Any</option>
                <option value="on-site">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Salary Range */}
            <div className="filter-group">
              <label>Min Salary</label>
              <input
                type="number"
                name="minSalary"
                placeholder="Minimum salary"
                value={filters.minSalary}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>Max Salary</label>
              <input
                type="number"
                name="maxSalary"
                placeholder="Maximum salary"
                value={filters.maxSalary}
                onChange={handleFilterChange}
              />
            </div>

            <button type="submit" className="search-btn">
              Search Jobs
            </button>
          </form>
        </aside>

        {/* Main Content */}
        <main className="jobs-main">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="no-jobs">
              <h3>No jobs found</h3>
              <p>Try adjusting your filters or search keywords</p>
            </div>
          ) : (
            <>
              <div className="jobs-results-header">
                <h2>Jobs Found: {pagination.total}</h2>
                <p>Showing {jobs.length} of {pagination.total} results</p>
              </div>

              <div className="jobs-grid">
                {jobs.map(job => (
                  <div key={job._id} className="job-card">
                    <div className="job-card-header">
                      <div className="job-title-section">
                        <h3 className="job-title">{job.title}</h3>
                        <p className="company-name">{job.company?.name || 'Unknown Company'}</p>
                      </div>
                      <div className="job-badges">
                        <span className="badge job-type">{job.jobType}</span>
                        <span className="badge level">{job.experienceLevel}</span>
                      </div>
                    </div>

                    <div className="job-card-body">
                      <div className="job-location">
                        <span className="icon">📍</span>
                        {job.location} • {job.locationType}
                      </div>

                      {job.salary && job.salary.min && (
                        <div className="job-salary">
                          <span className="icon">💰</span>
                          {formatSalary(job.salary)}
                        </div>
                      )}

                      <p className="job-description">{job.description.substring(0, 150)}...</p>

                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="job-skills">
                          <span className="skills-label">Required Skills:</span>
                          <div className="skills-list">
                            {job.requiredSkills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="skill-tag">
                                {skill.skill}
                              </span>
                            ))}
                            {job.requiredSkills.length > 3 && (
                              <span className="skill-tag more">+{job.requiredSkills.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="job-meta">
                        <span className="posted-date">
                          Posted {new Date(job.postedAt).toLocaleDateString()}
                        </span>
                        <span className="view-count">
                          👁️ {job.viewCount || 0} views
                        </span>
                      </div>
                    </div>

                    <div className="job-card-footer">
                      <button 
                        className="view-details-btn"
                        onClick={() => navigate(`/job/${job._id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={pagination.page === 1}
                    onClick={() => handlePagination(pagination.page - 1)}
                  >
                    ← Previous
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum = pagination.page - 2 + i;
                      if (pageNum < 1) pageNum = 1;
                      if (pageNum > pagination.pages) pageNum = pagination.pages - (4 - i);
                      return pageNum > 0 ? (
                        <button
                          key={pageNum}
                          className={`page-btn ${pageNum === pagination.page ? 'active' : ''}`}
                          onClick={() => handlePagination(pageNum)}
                        >
                          {pageNum}
                        </button>
                      ) : null;
                    })}
                  </div>

                  <button
                    className="pagination-btn"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => handlePagination(pagination.page + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobFinder;

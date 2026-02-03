# Recruiter-Posted Jobs Visibility in Candidate Portal

## Overview
This document outlines the changes made to make jobs posted by recruiters in the recruiter portal visible to candidates in the candidate portal.

## Changes Made

### 1. Backend - Recruiter Controller Enhancement
**File**: `backend/controllers/recruiterController.js`

**Change**: Added explicit status and isActive fields to ensure recruiter-posted jobs are immediately visible
```javascript
const job = await Job.create({
  title,
  company,
  location,
  description,
  skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
  requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
  salary: salary || undefined,
  jobType,
  applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
  postedBy: req.user._id,
  status: 'Open',        // ← Added explicitly
  isActive: true,        // ← Added explicitly
});
```

**Impact**: Jobs created via recruiter portal now have explicit `status: 'Open'` and `isActive: true` flags, ensuring they're available through the public job fetch API.

### 2. Frontend - JobExploration Component Updates
**File**: `my-project/src/components/pages/items/JobExploration.js`

#### 2.1 Added API Base URL Constant
```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

#### 2.2 Created New Function: `fetchRecruiterPostedJobs()`
This new function fetches open jobs posted by recruiters from the internal database:
```javascript
const fetchRecruiterPostedJobs = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/jobs?status=Open&limit=100`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const jobs = Array.isArray(data?.data) ? data.data : [];
    
    return jobs.map(job => ({
      _id: job._id,
      title: job.title,
      company: job.company,
      requiredQualification: 'graduate',
      location: job.location,
      jobType: 'Private Sector',
      salary: job.salary || job.salaryRange ? /* format salary */ : 'Not specified',
      description: job.description,
      skills: Array.isArray(job.skills) ? job.skills : [],
      postedDate: job.postedDate,
      applicationDeadline: job.applicationDeadline,
      source: 'Future Forge Recruiter',
      level: job.level || 'Mid-level'
    }));
  } catch (err) {
    console.error('Error fetching recruiter posted jobs:', err);
    return [];
  }
};
```

#### 2.3 Updated `fetchAllJobs()` Function
Modified to include recruiter-posted jobs alongside Jooble and Sarkari Result jobs:
```javascript
const fetchAllJobs = async () => {
  try {
    const [joobleJobs, sarkariJobs, recruiterJobs] = await Promise.all([
      fetchJoobleJobs(),
      fetchSarkariResultJobs(),
      fetchRecruiterPostedJobs()  // ← Added
    ]);

    let allJobs = [...recruiterJobs, ...joobleJobs, ...sarkariJobs];
    // Rest of filtering logic...
  } catch (err) {
    // ...
  }
};
```

#### 2.4 Updated All API Endpoints to Use API_BASE
Changed hardcoded `http://localhost:5000` URLs to use the `API_BASE` constant for better configuration management:
- `/api/jobs/explore` - Jooble jobs
- `/api/scrape/sarkari-result` - Sarkari Result jobs  
- `/api/jobs` - Recruiter-posted jobs (NEW)
- `/api/match/resume-jobs` - Resume matching

## Job Flow

### Recruiter Job Posting Flow
1. Recruiter fills job form in PostJob component
2. Form data sent to `/api/recruiter/jobs` endpoint
3. Backend creates Job document with:
   - `postedBy: recruiter._id`
   - `status: 'Open'`
   - `isActive: true`
4. Job immediately available for candidates to see

### Candidate Job Discovery Flow
1. Candidate visits Job Exploration page
2. JobExploration component fetches jobs from three sources:
   - **Recruiter-posted jobs**: `/api/jobs?status=Open`
   - **Jooble jobs**: `/api/jobs/explore` (external API)
   - **Sarkari Result jobs**: `/api/scrape/sarkari-result` (government jobs)
3. All jobs combined and displayed with "Future Forge Recruiter" source label for recruiter jobs
4. Candidate can view, apply to, or match resume against recruiter-posted jobs

## Job Visibility Criteria

Jobs are visible in the candidate portal when:
- ✅ `status === 'Open'`
- ✅ `isActive === true`
- ✅ Posted via `/api/recruiter/jobs` endpoint

Jobs can be made invisible by:
- Changing `status` to 'Closed', 'On Hold', or 'Filled'
- Setting `isActive` to false

## API Endpoints Reference

### Create Job (Recruiter)
```
POST /api/recruiter/jobs
Authorization: Bearer <token>

Request:
{
  "title": "Senior Developer",
  "company": "Tech Corp",
  "location": "Mumbai",
  "description": "...",
  "skills": ["Node.js", "React"],
  "requirements": ["3+ years experience"],
  "jobType": "Full-time",
  "salary": "10-15 LPA"
}

Response:
{
  "success": true,
  "message": "Job posted successfully",
  "data": { job object with status: 'Open', isActive: true }
}
```

### Get All Open Jobs (Candidate)
```
GET /api/jobs?status=Open&limit=100

Response:
{
  "success": true,
  "count": 25,
  "total": 100,
  "data": [ {...job1}, {...job2}, ... ]
}
```

## Testing the Feature

### Step 1: Recruiter Posts a Job
1. Log in as recruiter
2. Go to "Post Job" page
3. Fill in job details (title, company, location, description, skills, etc.)
4. Click "Post Job"
5. Job appears in Recruiter Dashboard under "My Jobs"

### Step 2: Candidate Sees the Job
1. Log in as candidate (or stay logged out to see public view)
2. Go to "Job Exploration" page
3. Scroll to see all job sources
4. Jobs posted by recruiters appear with "Future Forge Recruiter" badge
5. Jobs are searchable and filterable

### Step 3: Candidate Applies
1. Click on a recruiter-posted job
2. Click "Apply Now" button
3. Application is recorded in backend

## Configuration

### Environment Variables
The API base URL can be configured via environment variable:
```
REACT_APP_API_URL=https://api.yourdomain.com
```

If not set, defaults to `http://localhost:5000` (development)

## Benefits

1. **Seamless Integration**: Recruiter jobs appear alongside other job sources
2. **Immediate Visibility**: Jobs are visible immediately after posting (status: 'Open' by default)
3. **Centralized Management**: All jobs managed through single database
4. **Scalability**: Supports unlimited job postings
5. **Resume Matching**: Candidates can match their resume against recruiter jobs
6. **Job Control**: Recruiters can close jobs when filled using status field

## Troubleshooting

### Recruiter jobs not appearing in candidate portal?

1. **Check job status**: Verify `status === 'Open'` in database
2. **Check isActive flag**: Ensure `isActive === true`
3. **Check API response**: Test GET `/api/jobs?status=Open` endpoint directly
4. **Check browser console**: Look for fetch errors in console
5. **Check network tab**: Verify API calls are being made

### Debug endpoints to test

```bash
# Get all open jobs
curl http://localhost:5000/api/jobs?status=Open

# Get recruiter's jobs
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/recruiter/jobs

# Test API connectivity
curl http://localhost:5000/api/jobs/stats
```

## Future Enhancements

1. **Job Status Updates**: Allow recruiters to change job status (Close, On Hold, Filled)
2. **Application Management**: View applications for posted jobs
3. **Advanced Filtering**: Filter by company, level, experience in candidate portal
4. **Job Analytics**: Track views, applications, and engagement
5. **Email Notifications**: Notify candidates of relevant jobs

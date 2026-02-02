# Job Posting & Recruitment Portal Backend

A comprehensive backend API for managing job postings and applications in a recruitment portal built with Node.js, Express, and MongoDB.

## Features

### Job Management
- **Create Job Postings**: Post new jobs with detailed information
- **Edit Job Postings**: Update job details and status
- **Delete Job Postings**: Remove outdated job postings
- **Search & Filter**: Advanced search with multiple filter options
- **Job Statistics**: Analytics on job performance and metrics
- **View Tracking**: Track how many users viewed a job

### Application Management
- **Job Applications**: Submit applications for job postings
- **Application Tracking**: Track all applicant submissions
- **Status Management**: Update application status through hiring pipeline
- **Interview Scheduling**: Schedule and manage interviews
- **Match Scoring**: Automatic skill matching between applicants and jobs
- **Recruiter Dashboard**: Comprehensive statistics for recruiters

## API Endpoints

### Job Endpoints

#### Get All Jobs
```
GET /api/jobs
Query Parameters:
  - page: int (default: 1)
  - limit: int (default: 10)
  - status: string (Open, Closed, On Hold, Filled)
  - category: string
  - location: string
  - level: string (Entry-level, Mid-level, Senior, Executive)

Response:
{
  "success": true,
  "count": 10,
  "total": 100,
  "pages": 10,
  "currentPage": 1,
  "data": [...]
}
```

#### Search Jobs
```
GET /api/jobs/search
Query Parameters:
  - query: string (search in title, description, company, skills)
  - location: string
  - jobType: string (Full-time, Part-time, Contract, Internship, Freelance)
  - category: string
  - level: string
  - minSalary: number
  - maxSalary: number
  - skills: string or array
  - page: int (default: 1)
  - limit: int (default: 10)
  - sortBy: string (postedDate, salary, views)

Response:
{
  "success": true,
  "count": 5,
  "total": 50,
  "pages": 10,
  "currentPage": 1,
  "data": [...]
}
```

#### Get Single Job
```
GET /api/jobs/:id
Response:
{
  "success": true,
  "data": { job object }
}
```
**Note**: View count is incremented with each request.

#### Create Job (Authenticated - Recruiter)
```
POST /api/jobs
Headers:
  Authorization: Bearer <token>

Request Body:
{
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "locationType": "On-site", // On-site, Remote, Hybrid
  "description": "We are looking for...",
  "skills": ["JavaScript", "React", "Node.js"],
  "requirements": ["5+ years experience", "Bachelor's degree"],
  "experience": 5,
  "salary": {
    "min": 120000,
    "max": 180000,
    "currency": "USD"
  },
  "benefits": ["Health Insurance", "401k", "Remote Work"],
  "jobType": "Full-time",
  "category": "Engineering",
  "industry": "Technology",
  "level": "Senior",
  "applicationDeadline": "2024-12-31",
  "responsibilities": ["Design systems", "Lead team"],
  "qualifications": ["Experience with microservices"],
  "perks": ["Free coffee", "Gym membership"],
  "tags": ["remote", "tech", "startup"]
}

Response:
{
  "success": true,
  "message": "Job created successfully",
  "data": { job object }
}
```

#### Update Job (Authenticated - Job Poster Only)
```
PUT /api/jobs/:id
Headers:
  Authorization: Bearer <token>

Request Body: (partial update)
{
  "title": "Updated Title",
  "status": "Closed"
}

Response:
{
  "success": true,
  "message": "Job updated successfully",
  "data": { updated job object }
}
```

#### Toggle Job Status (Authenticated - Job Poster Only)
```
PATCH /api/jobs/:id/status
Headers:
  Authorization: Bearer <token>

Request Body:
{
  "status": "Open" // or Closed, On Hold, Filled
}

Response:
{
  "success": true,
  "message": "Job status updated to Open",
  "data": { updated job object }
}
```

#### Delete Job (Authenticated - Job Poster Only)
```
DELETE /api/jobs/:id
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Job deleted successfully"
}
```

#### Get Recruiter's Jobs (Authenticated)
```
GET /api/jobs/recruiter/my-jobs
Headers:
  Authorization: Bearer <token>

Query Parameters:
  - page: int
  - limit: int
  - status: string

Response:
{
  "success": true,
  "count": 5,
  "total": 15,
  "pages": 3,
  "currentPage": 1,
  "data": [...]
}
```

#### Get Job Statistics
```
GET /api/jobs/stats

Response:
{
  "success": true,
  "data": {
    "totalJobs": 150,
    "openJobs": 120,
    "closedJobs": 30,
    "jobsByCategory": [...],
    "jobsByLevel": [...]
  }
}
```

### Application Endpoints

#### Apply for Job (Authenticated - Applicant)
```
POST /api/applications/:jobId/apply
Headers:
  Authorization: Bearer <token>

Request Body:
{
  "coverLetter": "I am interested in this position...",
  "resumeUrl": "https://example.com/resume.pdf" // optional, uses user's resume if not provided
}

Response:
{
  "success": true,
  "message": "Application submitted successfully",
  "data": { application object }
}
```

#### Get My Applications (Authenticated - Applicant)
```
GET /api/applications/applicant/my-applications
Headers:
  Authorization: Bearer <token>

Query Parameters:
  - page: int
  - limit: int
  - status: string

Response:
{
  "success": true,
  "count": 5,
  "total": 12,
  "pages": 3,
  "currentPage": 1,
  "data": [...]
}
```

#### Withdraw Application (Authenticated - Applicant)
```
DELETE /api/applications/:applicationId/withdraw
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Application withdrawn successfully",
  "data": { updated application object }
}
```

#### Get Job Applications (Authenticated - Recruiter)
```
GET /api/applications/job/:jobId/applications
Headers:
  Authorization: Bearer <token>

Query Parameters:
  - page: int
  - limit: int
  - status: string
  - sortBy: string (appliedDate, rating, matchScore)

Response:
{
  "success": true,
  "count": 10,
  "total": 45,
  "pages": 5,
  "currentPage": 1,
  "data": [...]
}
```

#### Get Single Application (Authenticated)
```
GET /api/applications/:applicationId
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": { application object with full details }
}
```

#### Update Application Status (Authenticated - Recruiter)
```
PATCH /api/applications/:applicationId/status
Headers:
  Authorization: Bearer <token>

Request Body:
{
  "status": "Shortlisted", // Applied, Shortlisted, Interview Scheduled, Interview Completed, Offered, Rejected, Withdrawn
  "notes": "Strong candidate with relevant experience",
  "rating": 4 // 1-5
}

Response:
{
  "success": true,
  "message": "Application status updated",
  "data": { updated application object }
}
```

#### Schedule Interview (Authenticated - Recruiter)
```
POST /api/applications/:applicationId/schedule-interview
Headers:
  Authorization: Bearer <token>

Request Body:
{
  "date": "2024-12-15",
  "time": "14:00",
  "interviewer": "John Doe",
  "location": "Conference Room A",
  "meetingLink": "https://meet.example.com/interview123" // optional for remote interviews
}

Response:
{
  "success": true,
  "message": "Interview scheduled successfully",
  "data": { updated application object }
}
```

#### Get Recruiter Statistics (Authenticated - Recruiter)
```
GET /api/applications/recruiter/stats
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "totalJobs": 10,
    "totalApplications": 150,
    "shortlistedApplications": 45,
    "rejectedApplications": 60,
    "offeredApplications": 15,
    "applicationsByJob": [...],
    "recentApplications": [...]
  }
}
```

## Database Models

### Job Schema
```javascript
{
  title: String (required),
  company: String (required),
  companyId: ObjectId,
  location: String (required),
  locationType: String (enum: On-site, Remote, Hybrid),
  description: String (required),
  skills: [String],
  requirements: [String],
  experience: Number,
  salary: { min, max, currency },
  benefits: [String],
  jobType: String (enum: Full-time, Part-time, Contract, Internship, Freelance),
  category: String,
  industry: String,
  level: String (enum: Entry-level, Mid-level, Senior, Executive),
  postedDate: Date,
  applicationDeadline: Date,
  updatedDate: Date,
  postedBy: ObjectId (ref: User),
  status: String (enum: Open, Closed, On Hold, Filled),
  isActive: Boolean,
  applicationsCount: Number,
  viewsCount: Number,
  responsibilities: [String],
  qualifications: [String],
  perks: [String],
  tags: [String]
}
```

### Application Schema
```javascript
{
  jobId: ObjectId (ref: Job),
  applicantId: ObjectId (ref: User),
  recruiterId: ObjectId (ref: User),
  status: String (enum: Applied, Shortlisted, Interview Scheduled, Interview Completed, Offered, Rejected, Withdrawn),
  resumeUrl: String,
  coverLetter: String,
  applicantName: String,
  applicantEmail: String,
  applicantPhone: String,
  applicantLocation: String,
  appliedDate: Date,
  shortlistedDate: Date,
  interviewDate: Date,
  offerDate: Date,
  rejectionDate: Date,
  withdrawalDate: Date,
  applicantRating: Number (1-5),
  recruiterNotes: String,
  rejectionReason: String,
  interviewDetails: {
    round: String,
    date: Date,
    time: String,
    interviewer: String,
    location: String,
    meetingLink: String,
    result: String,
    feedback: String
  },
  offerDetails: {
    salary: Number,
    currency: String,
    joiningDate: Date,
    acceptanceDeadline: Date,
    additionalBenefits: [String],
    contractTerms: String
  },
  matchScore: Number (0-100),
  lastUpdated: Date,
  isActive: Boolean,
  viewedByRecruiter: Boolean,
  viewedDate: Date
}
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Error Handling

All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Setup & Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Environment variables** (.env):
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

3. **Start the server**:
```bash
npm start
```

## File Structure

```
backend/
├── models/
│   ├── Job.js
│   ├── Application.js
│   └── User.js
├── controllers/
│   ├── jobController.js
│   └── applicationController.js
├── services/
│   ├── jobService.js
│   └── applicationService.js
├── routes/
│   ├── jobRoutes.js
│   └── applicationRoutes.js
├── middleware/
│   └── authMiddleware.js
└── config/
    └── collections.js
```

## Best Practices

1. **Authentication**: Always include token in protected endpoints
2. **Pagination**: Use page and limit parameters for large datasets
3. **Filtering**: Apply filters to reduce response data
4. **Status Codes**: 
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 500: Server Error

5. **Data Validation**: All inputs are validated server-side
6. **Authorization**: Users can only modify their own jobs/applications

## Notes

- Job application count is automatically incremented when an application is submitted
- View count is incremented each time a job is viewed
- Match score is calculated based on skill overlap between applicant and job
- Duplicate applications are prevented
- All timestamps are recorded for audit trails

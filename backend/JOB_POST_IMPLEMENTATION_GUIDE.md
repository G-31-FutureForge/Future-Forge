# Job Post Backend Implementation Guide

## Overview
This guide helps you set up and use the Job Post backend system for the Future-Forge recruitment portal.

## What's Included

### 1. **JobPost Model** (`backend/models/JobPost.js`)
A comprehensive MongoDB schema for job postings with:
- Job details (title, description, location, type, experience level)
- Compensation information (salary ranges, benefits)
- Skills requirements (required and preferred)
- Application management (tracking candidate applications)
- Status workflow (draft, published, closed, archived)
- Analytics (view count, application count)

### 2. **JobPost Controller** (`backend/controllers/jobPostController.js`)
13 API endpoint handlers:
- `createJobPost` - Create new job post
- `getAllJobPosts` - List all public job posts
- `getJobPost` - View single job post (increments view count)
- `getMyJobPosts` - Get recruiter's own job posts
- `updateJobPost` - Update job post details
- `deleteJobPost` - Delete job post
- `searchJobPosts` - Advanced search with filters
- `applyForJob` - Submit job application
- `getJobApplications` - View all applications for a job
- `updateApplicationStatus` - Update application status (pending→shortlisted→offered)
- `closeJobPost` - Close job posting
- `publishJobPost` - Publish draft job post
- `getJobPostStats` - View analytics for job post

### 3. **JobPost Routes** (`backend/routes/jobPostRoutes.js`)
RESTful API endpoints with proper authentication and authorization:
```
Public Routes:
  GET    /                      - List all job posts
  GET    /search/advanced       - Search and filter jobs
  GET    /:id                   - View job details

Protected Routes (Authentication required):
  POST   /                      - Create job post (Recruiter/Admin)
  PUT    /:id                   - Update job post (Owner/Admin)
  DELETE /:id                   - Delete job post (Owner/Admin)

Recruiter Routes:
  GET    /recruiter/my-jobs     - View own job posts
  PUT    /:id/publish           - Publish draft job post
  PUT    /:id/close             - Close job posting
  GET    /:id/statistics        - View job analytics

Application Routes:
  POST   /:id/apply             - Apply for job (Student)
  GET    /:id/applications      - View applications (Owner)
  PUT    /:id/applications/:appId - Update application status (Owner)
```

### 4. **Database Configuration**
Updated `backend/config/collections.js` with:
```javascript
{
  USERS: 'users',
  COMPANIES: 'companies',
  JOBS: 'jobs',
  jobPosts: 'jobPosts'  // New collection
}
```

### 5. **Server Integration**
Updated `backend/server.js` to register job post routes:
```javascript
app.use('/api/job-posts', jobPostRoutes);
```

---

## Installation Steps

### Step 1: Verify File Structure
Ensure all files are created in the correct locations:
```
backend/
├── models/
│   ├── User.js
│   ├── Job.js
│   ├── Company.js
│   └── JobPost.js ✅ NEW
├── controllers/
│   ├── jobController.js
│   ├── recruiterController.js
│   └── jobPostController.js ✅ NEW
├── routes/
│   ├── jobRoutes.js
│   ├── recruiterRoutes.js
│   └── jobPostRoutes.js ✅ NEW
├── config/
│   ├── db.js
│   └── collections.js ✅ UPDATED
├── middleware/
│   └── authMiddleware.js
└── server.js ✅ UPDATED
```

### Step 2: Restart Backend Server
```bash
cd backend
npm install  # If any new dependencies were added
npm start
```

### Step 3: Verify Installation
Check health endpoint:
```bash
curl http://localhost:5000/api/health
```

Test a simple endpoint:
```bash
curl http://localhost:5000/api/job-posts
```

---

## Usage Workflow

### Workflow 1: Recruiter Posts a Job

#### Step 1: Create Job Post (Draft)
```bash
POST /api/job-posts
Authorization: Bearer <recruiter_token>
Content-Type: application/json

{
  "title": "Senior Backend Developer",
  "description": "Join our growing team...",
  "company": "507f1f77bcf86cd799439011",
  "location": "San Francisco, CA",
  "locationType": "hybrid",
  "jobType": "Full-time",
  "experienceLevel": "Senior",
  "minEducation": "Bachelor",
  "salary": {
    "min": 130000,
    "max": 180000,
    "currency": "USD",
    "salaryType": "annual"
  },
  "requiredSkills": [
    {
      "skill": "Python",
      "level": "Advanced",
      "yearsRequired": 5
    }
  ],
  "status": "draft"
}
```

#### Step 2: Publish Job Post
```bash
PUT /api/job-posts/{job_id}/publish
Authorization: Bearer <recruiter_token>
```

#### Step 3: Monitor Applications
```bash
GET /api/job-posts/{job_id}/applications
Authorization: Bearer <recruiter_token>
```

#### Step 4: Update Application Status
```bash
PUT /api/job-posts/{job_id}/applications/{app_id}
Authorization: Bearer <recruiter_token>
Content-Type: application/json

{
  "status": "shortlisted",
  "notes": "Great technical skills, schedule interview",
  "ratings": 4.5
}
```

---

### Workflow 2: Student Applies for Job

#### Step 1: Search for Jobs
```bash
GET /api/job-posts/search/advanced?query=developer&location=San%20Francisco&jobType=Full-time
```

#### Step 2: View Job Details
```bash
GET /api/job-posts/{job_id}
```

#### Step 3: Apply for Job
```bash
POST /api/job-posts/{job_id}/apply
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "resume": "https://example.com/my-resume.pdf",
  "coverLetter": "I am very interested in this position..."
}
```

---

## API Examples

### Example 1: Create a Complete Job Post
```bash
curl -X POST http://localhost:5000/api/job-posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Full Stack Developer",
    "description": "We are looking for a talented full-stack developer to join our growing team. You will work on modern web technologies and collaborate with cross-functional teams.",
    "company": "507f1f77bcf86cd799439011",
    "location": "Austin, TX",
    "locationType": "hybrid",
    "jobType": "Full-time",
    "experienceLevel": "Mid-level",
    "numberOfPositions": 3,
    "salary": {
      "min": 100000,
      "max": 140000,
      "currency": "USD",
      "salaryType": "annual"
    },
    "benefits": ["Health Insurance", "401k", "Flexible Hours", "Remote Work"],
    "requiredSkills": [
      {
        "skill": "JavaScript",
        "level": "Advanced",
        "yearsRequired": 3
      },
      {
        "skill": "React",
        "level": "Advanced",
        "yearsRequired": 2
      },
      {
        "skill": "Node.js",
        "level": "Intermediate",
        "yearsRequired": 2
      }
    ],
    "qualifications": [
      "BS in Computer Science or equivalent",
      "3+ years of web development experience",
      "Experience with agile development"
    ],
    "requirements": [
      "Git proficiency",
      "REST API experience",
      "Database design knowledge"
    ],
    "responsibilities": [
      "Develop and maintain web applications",
      "Participate in code reviews",
      "Mentor junior developers",
      "Collaborate with product and design teams"
    ],
    "minEducation": "Bachelor",
    "applicationDeadline": "2026-03-31",
    "tags": ["javascript", "react", "nodejs", "fullstack"],
    "category": "Engineering",
    "department": "Engineering",
    "reportingTo": "Engineering Manager",
    "status": "draft"
  }'
```

### Example 2: Advanced Job Search
```bash
# Search for senior Python developers in remote roles with salary > $120k
curl -X GET "http://localhost:5000/api/job-posts/search/advanced?query=python&experienceLevel=Senior&locationType=remote&minSalary=120000&limit=50"
```

### Example 3: View Job Statistics
```bash
curl -X GET http://localhost:5000/api/job-posts/507f1f77bcf86cd799439011/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Key Features

### 1. **Complete Job Lifecycle**
- Draft → Published → Applications → Closed → Archived

### 2. **Advanced Filtering**
- By location, job type, experience level
- By salary range, skills requirements
- By company, category, and custom tags

### 3. **Application Tracking**
- Track each application's status
- Rate candidates
- Add internal notes
- Monitor conversion metrics

### 4. **Analytics & Insights**
- View count tracking
- Application statistics
- Status breakdown
- Time since posting

### 5. **Role-Based Access Control**
- **Students**: Apply for jobs, view job details
- **Recruiters**: Create and manage job posts, track applications
- **Admins**: Full access to all operations

### 6. **Data Validation**
- Required field validation
- Email format validation
- URL validation for salary and website fields
- Date validation for deadlines

### 7. **Security**
- JWT-based authentication
- Authorization checks on all protected routes
- Prevention of unauthorized modifications
- Secure password hashing (inherited from User model)

---

## Advanced Features

### Salary Filtering
Jobs can have flexible salary information:
- Minimum and maximum salary ranges
- Multiple currency support (USD, EUR, INR, etc.)
- Salary type: annual, monthly, or hourly

### Skills Management
- Required and preferred skills tracking
- Skill level assessment (Beginner, Intermediate, Advanced, Expert)
- Years of experience requirements

### Location Flexibility
- On-site, remote, and hybrid work options
- Location-based filtering and search

### Application Workflow
Track applications through stages:
1. **Pending** - Initial submission
2. **Shortlisted** - Selected for interview
3. **Interviewed** - Interview completed
4. **Offered** - Job offer sent
5. **Rejected** - Application rejected

---

## Database Queries

The JobPost model uses MongoDB indexes for optimal performance:

```javascript
// Text search on job title and description
db.jobPosts.find({ $text: { $search: "developer" } })

// Filter by recruiter and status
db.jobPosts.find({ postedBy: "...", status: "published" })

// Find jobs by deadline
db.jobPosts.find({ 
  applicationDeadline: { 
    $gte: new Date(), 
    $lte: new Date(Date.now() + 7*24*60*60*1000) 
  } 
})

// Find jobs by salary range
db.jobPosts.find({ 
  "salary.min": { $lte: 100000 },
  "salary.max": { $gte: 100000 }
})
```

---

## Troubleshooting

### Issue: "Company not found"
**Solution**: Ensure the company ID is valid and exists in the database.

### Issue: "Not authorized to access this route"
**Solution**: Check that you're including a valid JWT token in the Authorization header.

### Issue: "Application already submitted"
**Solution**: A student can only apply once per job. To reapply, contact support.

### Issue: Job post not appearing in search
**Solution**: Ensure the job post status is 'published' and isActive is true.

---

## Environment Variables

Make sure your `.env` file includes:
```
MONGO_URI=mongodb://...
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

---

## Next Steps

1. **Frontend Integration**: Create React components for job posting and application forms
2. **Email Notifications**: Send emails when applications are submitted or status changes
3. **Job Recommendations**: Add ML-based job recommendations for students
4. **Analytics Dashboard**: Build recruiter dashboard with job post analytics
5. **Saved Jobs**: Allow students to save jobs for later viewing

---

## Support

For issues or questions, refer to:
- API Documentation: `JOB_POST_API_DOCUMENTATION.md`
- Backend Code: Review files in `backend/models`, `backend/controllers`, `backend/routes`
- MongoDB Documentation: https://docs.mongodb.com


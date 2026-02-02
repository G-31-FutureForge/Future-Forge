# Job Post Backend - Quick Reference Guide

## 🚀 Quick Start

### Installation
```bash
# Files are already created, just restart the server
cd backend
npm start
```

### Test the API
```bash
# List all job posts
curl http://localhost:5000/api/job-posts

# Search for jobs
curl "http://localhost:5000/api/job-posts/search/advanced?query=developer&jobType=Full-time"
```

---

## 📁 File Structure

```
backend/
├── models/
│   └── JobPost.js              # MongoDB schema for job posts
├── controllers/
│   └── jobPostController.js     # 13 API handlers
├── routes/
│   └── jobPostRoutes.js         # API endpoints
├── config/
│   └── collections.js           # Updated with jobPosts collection
├── server.js                    # Updated with job post routes
├── JOB_POST_API_DOCUMENTATION.md        # Full API reference
└── JOB_POST_IMPLEMENTATION_GUIDE.md     # Implementation guide
```

---

## 🔌 API Endpoints

### Public Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/job-posts` | List all published jobs |
| GET | `/api/job-posts/:id` | View job details |
| GET | `/api/job-posts/search/advanced` | Search and filter jobs |

### Recruiter Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/job-posts` | Create job post |
| GET | `/api/job-posts/recruiter/my-jobs` | View own jobs |
| PUT | `/api/job-posts/:id` | Update job post |
| DELETE | `/api/job-posts/:id` | Delete job post |
| PUT | `/api/job-posts/:id/publish` | Publish draft job |
| PUT | `/api/job-posts/:id/close` | Close job posting |
| GET | `/api/job-posts/:id/applications` | View applications |
| PUT | `/api/job-posts/:id/applications/:appId` | Update app status |
| GET | `/api/job-posts/:id/statistics` | View analytics |

### Student Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/job-posts/:id/apply` | Apply for job |

---

## 💡 Common Operations

### Create a Job Post
```bash
curl -X POST http://localhost:5000/api/job-posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Developer",
    "description": "Join our team",
    "company": "507f...",
    "location": "NYC",
    "jobType": "Full-time",
    "experienceLevel": "Senior",
    "minEducation": "Bachelor"
  }'
```

### Search Jobs
```bash
# All parameters are optional
curl "http://localhost:5000/api/job-posts/search/advanced?
  query=python
  &location=SF
  &jobType=Full-time
  &experienceLevel=Senior
  &minSalary=100000
  &page=1
  &limit=20"
```

### Apply for Job
```bash
curl -X POST http://localhost:5000/api/job-posts/{id}/apply \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "resume": "https://...",
    "coverLetter": "I am interested..."
  }'
```

### Get Applications
```bash
curl -X GET http://localhost:5000/api/job-posts/{id}/applications \
  -H "Authorization: Bearer <token>"
```

### Update Application Status
```bash
curl -X PUT http://localhost:5000/api/job-posts/{id}/applications/{appId} \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shortlisted",
    "notes": "Great candidate",
    "ratings": 4.5
  }'
```

---

## 🎯 Authentication & Authorization

### Required Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Roles
- **student**: Can view jobs, apply for jobs
- **recruiter**: Can create, edit, delete jobs; manage applications
- **admin**: Full access

### Protected Routes
Most endpoints require authentication. Include JWT token in header.

---

## 📊 JobPost Schema Overview

```javascript
{
  title: String,                    // Job title
  description: String,              // Job description
  company: ObjectId,                // Reference to Company
  location: String,                 // Job location
  locationType: String,             // on-site | remote | hybrid
  jobType: String,                  // Full-time | Part-time | etc
  experienceLevel: String,          // Entry | Mid | Senior | etc
  numberOfPositions: Number,        // # of positions available
  
  salary: {                         // Compensation
    min: Number,
    max: Number,
    currency: String,               // USD, EUR, etc
    salaryType: String              // annual | monthly | hourly
  },
  
  requiredSkills: Array,            // Skills needed
  preferredSkills: Array,           // Skills preferred
  qualifications: Array,            // Qualifications
  requirements: Array,              // Requirements
  responsibilities: Array,          // Job responsibilities
  minEducation: String,             // Education requirement
  
  applications: Array,              // Applications from candidates
  totalApplications: Number,        // Count of applications
  viewCount: Number,                // # of views
  
  status: String,                   // draft | published | closed
  isActive: Boolean,                // Active or archived
  postedBy: ObjectId,               // Reference to User (recruiter)
  postedAt: Date,                   // When posted
  applicationDeadline: Date,        // Application deadline
  
  tags: Array,                      // Tags for categorization
  category: String,                 // Job category
  department: String,               // Department name
  reportingTo: String,              // Reports to position
}
```

---

## 🔍 Search Filters

```
query              - Search term (title, description, skills)
location           - Location name
jobType            - Full-time, Part-time, Contract, Internship
experienceLevel    - Entry, Mid, Senior, Executive, Fresher
minSalary          - Minimum salary
maxSalary          - Maximum salary
company            - Company ID
category           - Job category
locationType       - on-site, remote, hybrid
page               - Page number (default: 1)
limit              - Items per page (default: 20)
```

---

## 📋 Application Workflow

```
┌─────────┐      ┌────────────┐      ┌─────────┐      ┌───────────┐      ┌────────┐
│ Pending │─────▶│ Shortlist  │─────▶│ Interview│─────▶│  Offered  │─────▶│ Hired  │
└─────────┘      └────────────┘      └─────────┘      └───────────┘      └────────┘
       │
       └──────────────────────────────────────────────────────────────────┐
                                                                           │
                                                                    ┌─────▼──────┐
                                                                    │  Rejected  │
                                                                    └────────────┘
```

Application Statuses:
- `pending` - Initial submission
- `shortlisted` - Selected for interview
- `interviewed` - Interview completed
- `offered` - Job offer extended
- `rejected` - Application rejected

---

## 🔒 Authorization Rules

```javascript
// Create Job Post
- Requires: Bearer token + recruiter/admin role

// View My Jobs
- Requires: Bearer token + recruiter/admin role
- Returns: Only recruiter's own jobs

// Update Job Post
- Requires: Bearer token + job post creator or admin
- Prevents: Changing postedBy or applications

// View Applications
- Requires: Bearer token + job post creator or admin

// Update Application
- Requires: Bearer token + job post creator or admin

// Apply for Job
- Requires: Bearer token + student role
- Prevents: Duplicate applications from same user

// Delete Job Post
- Requires: Bearer token + job post creator or admin
```

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 - Not authorized | Missing/invalid token | Include valid JWT in Authorization header |
| 403 - Not authorized | Wrong role | Use recruiter account for creating jobs |
| 400 - Missing fields | Incomplete request | Check all required fields are provided |
| 404 - Not found | Invalid ID | Verify job/application ID exists |
| 400 - Already applied | Duplicate application | Check if student already applied |

---

## 📝 Response Examples

### Success Response (201 - Created)
```json
{
  "success": true,
  "message": "Job post created successfully",
  "data": { ... }
}
```

### Error Response (400 - Bad Request)
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### List Response (200 - OK)
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## 🔧 Environment Setup

Required `.env` variables:
```
MONGO_URI=mongodb://localhost:27017/future-forge
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

---

## 📚 Documentation Files

1. **JOB_POST_API_DOCUMENTATION.md** - Complete API reference
   - Detailed endpoint descriptions
   - Request/response examples
   - All query parameters
   - Error codes and handling

2. **JOB_POST_IMPLEMENTATION_GUIDE.md** - Implementation details
   - Installation steps
   - Usage workflows
   - Advanced features
   - Troubleshooting guide

3. **Quick Reference Guide** (this file)
   - Quick start
   - Common operations
   - Schema overview
   - Authorization rules

---

## 🚨 Important Notes

- ✅ Draft jobs are not visible publicly
- ✅ View count increments on each job view
- ✅ Students can only apply once per job
- ✅ Only recruiter who posted job can manage it
- ✅ Salary information is optional
- ✅ Application deadline is optional but recommended
- ✅ All endpoints use UTC timestamps

---

## 🎓 Example Use Cases

### Use Case 1: Recruiter Posts Job
1. Create job post (status: draft)
2. Review and make changes
3. Publish job (status: published)
4. Monitor applications
5. Update application statuses
6. Close job when hiring complete

### Use Case 2: Student Finds Job
1. Search available jobs with filters
2. View job details
3. Apply with resume and cover letter
4. Track application status

### Use Case 3: Recruiter Analytics
1. View job statistics (views, applications)
2. See application breakdown by status
3. Rate candidates
4. Track conversion metrics

---

## 🔗 Integration Points

### Frontend Integration
- Job listing page: `GET /api/job-posts`
- Job details page: `GET /api/job-posts/:id`
- Job application form: `POST /api/job-posts/:id/apply`
- Recruiter dashboard: `GET /api/job-posts/recruiter/my-jobs`

### Email Notifications (Future)
- New application submitted
- Application status changed
- Job posting deadline reminder
- Job post closed

### Analytics (Future)
- View trends
- Application conversion rates
- Popular job categories
- Salary insights

---

## 📞 Support

For detailed information, see:
- API Docs: `JOB_POST_API_DOCUMENTATION.md`
- Implementation Guide: `JOB_POST_IMPLEMENTATION_GUIDE.md`
- Backend Code: `backend/controllers/jobPostController.js`


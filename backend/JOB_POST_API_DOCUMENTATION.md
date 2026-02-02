# Job Post Backend API Documentation

## Overview
This is a comprehensive job posting backend for the Future-Forge recruitment portal. It handles job post creation, management, applications, and recruitment workflows.

## Base URL
```
http://localhost:5000/api/job-posts
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Models

### JobPost Schema

```javascript
{
  // Basic Information
  title: String (required),
  description: String (required, max 5000 chars),
  company: ObjectId (ref: Company, required),
  location: String (required),
  locationType: String (enum: 'on-site', 'remote', 'hybrid', default: 'on-site'),
  
  // Job Details
  jobType: String (enum: 'Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary', required),
  experienceLevel: String (enum: 'Entry-level', 'Mid-level', 'Senior', 'Executive', 'Fresher', required),
  numberOfPositions: Number (min: 1, default: 1),
  
  // Compensation & Benefits
  salary: {
    min: Number,
    max: Number,
    currency: String (default: 'USD'),
    salaryType: String (enum: 'annual', 'monthly', 'hourly', default: 'annual')
  },
  benefits: [String],
  
  // Requirements & Skills
  requiredSkills: [{
    skill: String,
    level: String (enum: 'Beginner', 'Intermediate', 'Advanced', 'Expert'),
    yearsRequired: Number
  }],
  preferredSkills: [{
    skill: String,
    level: String
  }],
  qualifications: [String],
  requirements: [String],
  responsibilities: [String],
  minEducation: String (enum: 'High School', 'Bachelor', 'Master', 'PhD', 'Diploma'),
  
  // Posting Information
  postedBy: ObjectId (ref: User, required),
  postedAt: Date (default: now),
  applicationDeadline: Date,
  
  // Status & Visibility
  status: String (enum: 'draft', 'published', 'closed', 'archived', default: 'draft'),
  isActive: Boolean (default: true),
  viewCount: Number (default: 0),
  
  // Applications
  applications: [{
    candidateId: ObjectId,
    appliedAt: Date,
    status: String (enum: 'pending', 'shortlisted', 'rejected', 'interviewed', 'offered'),
    resume: String,
    coverLetter: String,
    notes: String,
    ratings: Number (0-5)
  }],
  totalApplications: Number (default: 0),
  
  // Additional
  tags: [String],
  category: String,
  department: String,
  reportingTo: String,
  createdAt: Date,
  updatedAt: Date,
  closedAt: Date
}
```

## Endpoints

### 1. Create a Job Post
**POST** `/`

**Authentication:** Required (Recruiter/Admin)

**Request Body:**
```json
{
  "title": "Senior Full Stack Developer",
  "description": "We are looking for an experienced full stack developer...",
  "company": "507f1f77bcf86cd799439011",
  "location": "San Francisco, CA",
  "locationType": "hybrid",
  "jobType": "Full-time",
  "experienceLevel": "Senior",
  "numberOfPositions": 2,
  "salary": {
    "min": 120000,
    "max": 160000,
    "currency": "USD",
    "salaryType": "annual"
  },
  "benefits": ["Health Insurance", "401k", "Remote Work"],
  "requiredSkills": [
    {
      "skill": "JavaScript",
      "level": "Advanced",
      "yearsRequired": 5
    },
    {
      "skill": "React",
      "level": "Advanced",
      "yearsRequired": 3
    }
  ],
  "preferredSkills": [
    {
      "skill": "Node.js",
      "level": "Advanced"
    }
  ],
  "qualifications": ["BS in Computer Science", "5+ years of experience"],
  "requirements": ["Experience with microservices", "Git proficiency"],
  "responsibilities": ["Develop scalable applications", "Code review", "Mentor junior developers"],
  "minEducation": "Bachelor",
  "applicationDeadline": "2026-03-15",
  "tags": ["backend", "frontend", "javascript", "react"],
  "category": "Engineering",
  "department": "Tech",
  "reportingTo": "Engineering Lead",
  "status": "draft"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Job post created successfully",
  "data": { ...jobPost }
}
```

---

### 2. Get All Job Posts
**GET** `/`

**Authentication:** Not required (Public)

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page
- `status` (default: 'published') - Filter by status
- `sort` (default: '-postedAt') - Sort field

**Response (200):**
```json
{
  "success": true,
  "data": [...jobPosts],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

### 3. Get Single Job Post
**GET** `/:id`

**Authentication:** Not required (Public)

**Response (200):**
```json
{
  "success": true,
  "data": { ...jobPost with incremented viewCount }
}
```

---

### 4. Search & Filter Job Posts
**GET** `/search/advanced`

**Authentication:** Not required (Public)

**Query Parameters:**
- `query` - Search term (searches title, description, skills, tags)
- `location` - Filter by location
- `jobType` - Filter by job type
- `experienceLevel` - Filter by experience level
- `minSalary` - Minimum salary filter
- `maxSalary` - Maximum salary filter
- `company` - Filter by company ID
- `category` - Filter by category
- `locationType` - Filter by location type (on-site, remote, hybrid)
- `page` (default: 1)
- `limit` (default: 20)

**Example:**
```
GET /search/advanced?query=developer&location=San%20Francisco&jobType=Full-time&experienceLevel=Senior&minSalary=100000
```

**Response (200):**
```json
{
  "success": true,
  "data": [...filteredJobPosts],
  "pagination": { ...paginationInfo }
}
```

---

### 5. Get My Job Posts (Recruiter)
**GET** `/recruiter/my-jobs`

**Authentication:** Required (Recruiter/Admin)

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` - Filter by status (optional)
- `sort` (default: '-postedAt')

**Response (200):**
```json
{
  "success": true,
  "data": [...myJobPosts],
  "pagination": { ...paginationInfo }
}
```

---

### 6. Update Job Post
**PUT** `/:id`

**Authentication:** Required (Job post creator/Admin)

**Request Body:** (Any fields to update)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "numberOfPositions": 3,
  "salary": { ... }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Job post updated successfully",
  "data": { ...updatedJobPost }
}
```

---

### 7. Delete Job Post
**DELETE** `/:id`

**Authentication:** Required (Job post creator/Admin)

**Response (200):**
```json
{
  "success": true,
  "message": "Job post deleted successfully"
}
```

---

### 8. Publish Job Post
**PUT** `/:id/publish`

**Authentication:** Required (Job post creator/Admin)

Changes status from 'draft' to 'published' and activates the job post.

**Response (200):**
```json
{
  "success": true,
  "message": "Job post published successfully",
  "data": { ...publishedJobPost }
}
```

---

### 9. Close Job Post
**PUT** `/:id/close`

**Authentication:** Required (Job post creator/Admin)

Changes status to 'closed' and deactivates the job post.

**Response (200):**
```json
{
  "success": true,
  "message": "Job post closed successfully",
  "data": { ...closedJobPost }
}
```

---

### 10. Apply for Job
**POST** `/:id/apply`

**Authentication:** Required (Student)

**Request Body:**
```json
{
  "resume": "https://url-to-resume.pdf",
  "coverLetter": "I am interested in this position because..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": { ...jobPostWithNewApplication }
}
```

**Error (400):** If already applied

---

### 11. Get Job Applications
**GET** `/:id/applications`

**Authentication:** Required (Job post creator/Admin)

**Response (200):**
```json
{
  "success": true,
  "data": [...applications],
  "totalApplications": 45
}
```

---

### 12. Update Application Status
**PUT** `/:id/applications/:appId`

**Authentication:** Required (Job post creator/Admin)

**Request Body:**
```json
{
  "status": "shortlisted",
  "notes": "Great candidate, invited for interview",
  "ratings": 4.5
}
```

**Status values:** 'pending', 'shortlisted', 'rejected', 'interviewed', 'offered'

**Response (200):**
```json
{
  "success": true,
  "message": "Application updated successfully",
  "data": { ...updatedApplication }
}
```

---

### 13. Get Job Post Statistics
**GET** `/:id/statistics`

**Authentication:** Required (Job post creator/Admin)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalApplications": 45,
    "viewCount": 1250,
    "applicationsByStatus": {
      "pending": 30,
      "shortlisted": 10,
      "rejected": 3,
      "interviewed": 2,
      "offered": 0
    },
    "postedAt": "2026-01-15T10:30:00Z",
    "daysSincePosted": 18
  }
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Error description"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Not authorized to perform this action"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Job post not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Authorization & Roles

### Public Endpoints
- GET `/` - List all published job posts
- GET `/:id` - View job post details
- GET `/search/advanced` - Search job posts

### Student Endpoints
- POST `/:id/apply` - Apply for a job

### Recruiter/Admin Endpoints
- POST `/` - Create job post
- GET `/recruiter/my-jobs` - View own job posts
- PUT `/:id` - Update job post
- DELETE `/:id` - Delete job post
- PUT `/:id/publish` - Publish job post
- PUT `/:id/close` - Close job post
- GET `/:id/applications` - View applications
- PUT `/:id/applications/:appId` - Update application status
- GET `/:id/statistics` - View job post statistics

---

## Usage Examples

### Example 1: Create a Job Post
```bash
curl -X POST http://localhost:5000/api/job-posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Full Stack Developer",
    "description": "Join our team...",
    "company": "507f1f77bcf86cd799439011",
    "location": "New York",
    "jobType": "Full-time",
    "experienceLevel": "Mid-level",
    "minEducation": "Bachelor",
    "status": "draft"
  }'
```

### Example 2: Search Jobs
```bash
curl -X GET "http://localhost:5000/api/job-posts/search/advanced?query=developer&location=New%20York&jobType=Full-time&minSalary=80000"
```

### Example 3: Apply for a Job
```bash
curl -X POST http://localhost:5000/api/job-posts/507f1f77bcf86cd799439012/apply \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume": "https://example.com/resume.pdf",
    "coverLetter": "I am very interested in this position..."
  }'
```

### Example 4: Update Application Status
```bash
curl -X PUT http://localhost:5000/api/job-posts/507f1f77bcf86cd799439012/applications/APPLICATION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shortlisted",
    "notes": "Candidate shows great promise",
    "ratings": 4
  }'
```

---

## Features

✅ **Complete Job Post Management** - Create, update, delete, publish, close job posts
✅ **Advanced Search & Filtering** - Filter by location, job type, experience level, salary, skills
✅ **Application Management** - Track applications with status workflow
✅ **Application Tracking** - View and manage candidate applications
✅ **Job Post Statistics** - Analytics on views and applications
✅ **Role-based Access Control** - Different permissions for students, recruiters, and admins
✅ **Comprehensive Validation** - Input validation and error handling
✅ **Pagination** - Efficient data retrieval with pagination
✅ **Text Search** - Full-text search on job titles and descriptions
✅ **Recruitment Workflow** - Status tracking from application to offer

---

## Database Indexes

The JobPost model includes the following indexes for optimal performance:

- `title` (text search)
- `description` (text search)
- `postedBy` + `status` (composite)
- `company` + `status` (composite)
- `applicationDeadline` (for deadline tracking)
- `location` (for location filtering)
- `jobType` (for type filtering)
- `experienceLevel` (for level filtering)

---

## Notes

- Job posts in 'draft' status are not visible publicly until published
- View count increments each time a job post is viewed
- Applications can only be submitted by users with 'student' role
- Recruiters can only manage their own job posts
- Application deadline is optional but recommended
- Salary information is optional and can be hidden if needed


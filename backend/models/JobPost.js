// backend/models/JobPost.js
import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/collections.js';

const applicationSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'shortlisted', 'rejected', 'interviewed', 'offered'],
        default: 'pending'
    },
    resume: {
        type: String,
        required: false
    },
    coverLetter: {
        type: String,
        required: false
    },
    notes: {
        type: String,
        required: false
    },
    ratings: {
        type: Number,
        min: 0,
        max: 5,
        required: false
    }
}, { _id: true });

const jobPostSchema = new mongoose.Schema({
    // Basic Information
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'Job description is required'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Company is required']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        index: true
    },
    locationType: {
        type: String,
        enum: ['on-site', 'remote', 'hybrid'],
        default: 'on-site'
    },
    
    // Job Details
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'],
        required: [true, 'Job type is required'],
        index: true
    },
    experienceLevel: {
        type: String,
        enum: ['Entry-level', 'Mid-level', 'Senior', 'Executive', 'Fresher'],
        required: true,
        index: true
    },
    numberOfPositions: {
        type: Number,
        min: 1,
        default: 1
    },
    
    // Compensation & Benefits
    salary: {
        min: {
            type: Number,
            required: false
        },
        max: {
            type: Number,
            required: false
        },
        currency: {
            type: String,
            default: 'USD'
        },
        salaryType: {
            type: String,
            enum: ['annual', 'monthly', 'hourly'],
            default: 'annual'
        }
    },
    benefits: [{
        type: String,
        trim: true
    }],
    
    // Requirements & Skills
    requiredSkills: [{
        skill: {
            type: String,
            required: true,
            trim: true
        },
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
            default: 'Intermediate'
        },
        yearsRequired: {
            type: Number,
            default: 0
        }
    }],
    preferredSkills: [{
        skill: {
            type: String,
            required: true,
            trim: true
        },
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
            default: 'Intermediate'
        }
    }],
    qualifications: [{
        type: String,
        trim: true
    }],
    requirements: [{
        type: String,
        trim: true
    }],
    
    // Responsibilities
    responsibilities: [{
        type: String,
        trim: true
    }],
    
    // Education
    minEducation: {
        type: String,
        enum: ['High School', 'Bachelor', 'Master', 'PhD', 'Diploma', 'No formal education required'],
        required: true
    },
    
    // Posting Information
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Posted by user is required']
    },
    postedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    applicationDeadline: {
        type: Date,
        required: false
    },
    
    // Status & Visibility
    status: {
        type: String,
        enum: ['draft', 'published', 'closed', 'archived'],
        default: 'draft',
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    viewCount: {
        type: Number,
        default: 0
    },
    
    // Applications
    applications: [applicationSchema],
    totalApplications: {
        type: Number,
        default: 0
    },
    
    // SEO & Additional Info
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        trim: true,
        index: true
    },
    department: {
        type: String,
        trim: true
    },
    reportingTo: {
        type: String,
        trim: true
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    closedAt: {
        type: Date,
        required: false
    }
}, {
    collection: COLLECTIONS.jobPosts,
    timestamps: true
});

// Indexes
jobPostSchema.index({ postedBy: 1, status: 1 });
jobPostSchema.index({ company: 1, status: 1 });
jobPostSchema.index({ title: 'text', description: 'text' });
jobPostSchema.index({ applicationDeadline: 1 });

// Update timestamps
jobPostSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Update total applications count
jobPostSchema.pre('save', function(next) {
    this.totalApplications = this.applications.length;
    next();
});

export default mongoose.model('JobPost', jobPostSchema, COLLECTIONS.jobPosts);

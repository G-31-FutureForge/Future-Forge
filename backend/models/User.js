// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { COLLECTIONS } from '../config/collections.js';

const educationSchema = new mongoose.Schema({
    institution: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    fieldOfStudy: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    currentlyEnrolled: { type: Boolean, default: false },
    grade: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 500 }
}, { _id: false });

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Beginner' },
    category: { type: String, enum: ['Technical', 'Soft', 'Language', 'Professional', 'Other'], default: 'Technical' },
    yearsOfExperience: { type: Number, min: 0, max: 50 },
    verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date
}, { _id: false });

const experienceSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    currentlyWorking: { type: Boolean, default: false },
    employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Self-employed'], default: 'Full-time' },
    description: { type: String, trim: true, maxlength: 1000 },
    skillsUsed: [{ type: String, trim: true }]
}, { _id: false });

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 500 },
    technologies: [{ type: String, trim: true }],
    projectUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    startDate: Date,
    endDate: Date,
    currentlyWorking: { type: Boolean, default: false }
}, { _id: false });

const certificationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    issuingOrganization: { type: String, required: true, trim: true },
    issueDate: { type: Date, required: true },
    expirationDate: Date,
    credentialId: { type: String, trim: true },
    credentialUrl: { type: String, trim: true },
    skills: [{ type: String, trim: true }]
}, { _id: false });

const resumeSchema = new mongoose.Schema({
    fileUrl: { type: String, trim: true },
    fileName: { type: String, trim: true },
    fileSize: Number,
    fileType: String,
    uploadedAt: { type: Date, default: Date.now },
    lastUpdated: Date,
    isPublic: { type: Boolean, default: true },
    downloadCount: { type: Number, default: 0 }
}, { _id: false });

const companyInfoSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    role: { type: String, enum: ['owner', 'admin', 'recruiter', 'hiring_manager', 'viewer', 'hr_manager', 'talent_acquisition'], default: 'recruiter' },
    joiningDate: { type: Date, default: Date.now },
    department: { type: String, trim: true },
    employeeId: { type: String, trim: true },
    permissions: {
        canPostJobs: { type: Boolean, default: true },
        canViewApplications: { type: Boolean, default: true },
        canInterviewCandidates: { type: Boolean, default: true },
        canManageTeam: { type: Boolean, default: false },
        canViewAnalytics: { type: Boolean, default: true },
        canManageCompanyProfile: { type: Boolean, default: false }
    }
}, { _id: false });

const recruiterProfileSchema = new mongoose.Schema({
    specialization: [{ type: String, trim: true }],
    yearsOfExperience: { type: Number, min: 0, max: 50 },
    hiringExpertise: [{ type: String, trim: true }],
    about: { type: String, trim: true, maxlength: 1000 },
    awards: [{ title: String, organization: String, year: Number, description: String }],
    totalHires: { type: Number, default: 0 },
    successRate: { type: Number, min: 0, max: 100, default: 0 },
    averageTimeToHire: Number,
    isVerifiedRecruiter: { type: Boolean, default: false }
}, { _id: false });

const studentProfileSchema = new mongoose.Schema({
    headline: { type: String, trim: true, maxlength: 200 },
    summary: { type: String, trim: true, maxlength: 1000 },
    careerObjective: { type: String, trim: true, maxlength: 500 },
    desiredJobTitles: [{ type: String, trim: true }],
    preferredLocations: [{ type: String, trim: true }],
    preferredJobTypes: [{ type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Hybrid', 'On-site'] }],
    salaryExpectation: { min: Number, max: Number, currency: { type: String, default: 'USD' } },
    availability: { type: String, enum: ['Immediately', '1 week', '2 weeks', '1 month', '2 months', '3 months+', 'Not available'], default: 'Immediately' },
    totalExperience: Number,
    profileCompletion: { type: Number, min: 0, max: 100, default: 0 }
}, { _id: false });

const userSchema = new mongoose.Schema({
    // Basic Information
    firstName: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    lastName: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6,
        select: false
    },
    userType: {
        type: String,
        enum: ['student', 'recruiter', 'admin'],
        default: 'student',
        required: true
    },
    
    // Contact Information
    phone: { type: String, trim: true },
    address: { street: String, city: String, state: String, country: String, zipCode: String },
    dateOfBirth: Date,
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    
    // Profile Information
    profileImage: { url: String, publicId: String },
    coverImage: { url: String, publicId: String },
    headline: { type: String, trim: true, maxlength: 200 },
    bio: { type: String, trim: true, maxlength: 500 },
    
    // Student-Specific Fields
    studentProfile: studentProfileSchema,
    education: [educationSchema],
    experience: [experienceSchema],
    skills: [skillSchema],
    projects: [projectSchema],
    certifications: [certificationSchema],
    resume: resumeSchema,
    portfolioUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    
    // Recruiter-Specific Fields
    recruiterProfile: recruiterProfileSchema,
    companyInfo: companyInfoSchema,
    
    // Job Applications & Activities (for students)
    savedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],
    appliedJobs: [{
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Accepted', 'Offer Sent', 'Withdrawn'],
            default: 'Applied'
        },
        notes: String
    }],
    interviewInvitations: [{
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job'
        },
        scheduledDate: Date,
        status: {
            type: String,
            enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled']
        },
        interviewer: String,
        meetingLink: String
    }],
    
    // Recruiter Activities
    postedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],
    candidateReviews: [{
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comments: String,
        reviewedAt: Date
    }],
    
    // Verification & Security
    emailVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    loginHistory: [{ timestamp: Date, ipAddress: String, userAgent: String }],
    
    // Preferences & Settings
    preferences: {
        emailNotifications: {
            jobAlerts: { type: Boolean, default: true },
            applicationUpdates: { type: Boolean, default: true },
            newsletter: { type: Boolean, default: true }
        },
        pushNotifications: { type: Boolean, default: true },
        privacy: {
            profileVisibility: { type: String, enum: ['Public', 'Connections', 'Private'], default: 'Public' },
            resumeVisibility: { type: Boolean, default: true },
            showEmail: { type: Boolean, default: false },
            showPhone: { type: Boolean, default: false }
        }
    },
    
    // Analytics & Statistics
    stats: {
        profileViews: { type: Number, default: 0 },
        resumeViews: { type: Number, default: 0 },
        totalApplications: { type: Number, default: 0 },
        interviewRate: { type: Number, default: 0 },
        jobMatchScore: { type: Number, min: 0, max: 100, default: 0 }
    },
    
    // For Recruiters
    recruiterStats: {
        totalJobsPosted: { type: Number, default: 0 },
        activeJobs: { type: Number, default: 0 },
        totalApplicationsReceived: { type: Number, default: 0 },
        candidatesHired: { type: Number, default: 0 },
        averageTimeToHire: { type: Number, default: 0 },
        candidateSatisfaction: { type: Number, min: 0, max: 5, default: 0 }
    }
    
}, { 
    timestamps: true,
    collection: COLLECTIONS.USERS,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for profile completion percentage
userSchema.virtual('profileCompletionPercentage').get(function() {
    if (this.userType === 'student') {
        return this.studentProfile?.profileCompletion || 0;
    } else if (this.userType === 'recruiter') {
        let completion = 0;
        if (this.companyInfo?.companyId) completion += 30;
        if (this.profileImage?.url) completion += 20;
        if (this.recruiterProfile?.about) completion += 25;
        if (this.recruiterProfile?.specialization?.length > 0) completion += 25;
        return completion;
    }
    return 0;
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ 'address.city': 1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ 'education.fieldOfStudy': 1 });
userSchema.index({ 'studentProfile.desiredJobTitles': 1 });
userSchema.index({ 'companyInfo.companyId': 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it's modified (or new)
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Update profile completion on save (for students)
userSchema.pre('save', function(next) {
    if (this.userType === 'student') {
        let completion = 0;
        
        // Calculate completion based on filled fields
        if (this.email) completion += 10;
        if (this.firstName && this.lastName) completion += 10;
        if (this.profileImage?.url) completion += 10;
        if (this.headline) completion += 10;
        if (this.bio) completion += 10;
        if (this.education?.length > 0) completion += 15;
        if (this.skills?.length > 0) completion += 15;
        if (this.experience?.length > 0) completion += 10;
        if (this.resume?.fileUrl) completion += 10;
        
        if (!this.studentProfile) {
            this.studentProfile = {};
        }
        this.studentProfile.profileCompletion = Math.min(100, completion);
    }
    
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    
    // Remove sensitive data
    delete userObject.password;
    delete userObject.verificationToken;
    delete userObject.verificationTokenExpires;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpires;
    delete userObject.loginHistory;
    delete userObject.preferences;
    
    // For students, keep only relevant info
    if (this.userType === 'student') {
        if (!userObject.preferences?.privacy?.showEmail) {
            delete userObject.email;
        }
        if (!userObject.preferences?.privacy?.showPhone) {
            delete userObject.phone;
        }
        if (!userObject.preferences?.privacy?.resumeVisibility) {
            delete userObject.resume;
        }
    }
    
    return userObject;
};

// Method to get profile for recruiters
userSchema.methods.getRecruiterProfile = function() {
    const profile = {
        _id: this._id,
        fullName: this.fullName,
        email: this.email,
        userType: this.userType,
        profileImage: this.profileImage,
        headline: this.headline,
        bio: this.bio,
        createdAt: this.createdAt,
        profileCompletion: this.profileCompletionPercentage
    };
    
    if (this.userType === 'student') {
        profile.education = this.education;
        profile.skills = this.skills;
        profile.experience = this.experience;
        profile.studentProfile = this.studentProfile;
        if (this.resume?.isPublic) {
            profile.resume = this.resume;
        }
    } else if (this.userType === 'recruiter') {
        profile.companyInfo = this.companyInfo;
        profile.recruiterProfile = this.recruiterProfile;
        profile.recruiterStats = this.recruiterStats;
    }
    
    return profile;
};

// Static method to find users by skills
userSchema.statics.findBySkills = function(skills, userType = 'student') {
    return this.find({
        userType: userType,
        'skills.name': { $in: skills },
        isActive: true
    }).select('firstName lastName email skills profileImage headline studentProfile');
};

// Static method to find recruiters by company
userSchema.statics.findRecruitersByCompany = function(companyId) {
    return this.find({
        userType: 'recruiter',
        'companyInfo.companyId': companyId,
        isActive: true
    }).select('firstName lastName email profileImage companyInfo.role');
};

// Method to add job application
userSchema.methods.addJobApplication = function(jobId, status = 'Applied') {
    this.appliedJobs.push({
        jobId: jobId,
        status: status
    });
    this.stats.totalApplications += 1;
    return this.save();
};

// Method to update application status
userSchema.methods.updateApplicationStatus = function(jobId, status) {
    const application = this.appliedJobs.find(app => app.jobId.toString() === jobId.toString());
    if (application) {
        application.status = status;
        application.updatedAt = new Date();
        return this.save();
    }
    return Promise.reject(new Error('Application not found'));
};

// Method to save job
userSchema.methods.saveJob = function(jobId) {
    if (!this.savedJobs.includes(jobId)) {
        this.savedJobs.push(jobId);
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to remove saved job
userSchema.methods.removeSavedJob = function(jobId) {
    this.savedJobs = this.savedJobs.filter(id => id.toString() !== jobId.toString());
    return this.save();
};

// Method to add posted job (for recruiters)
userSchema.methods.addPostedJob = function(jobId) {
    if (!this.postedJobs.includes(jobId)) {
        this.postedJobs.push(jobId);
        this.recruiterStats.totalJobsPosted += 1;
        this.recruiterStats.activeJobs += 1;
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to add profile view
userSchema.methods.addProfileView = function() {
    this.stats.profileViews += 1;
    return this.save();
};

// Method to add resume view
userSchema.methods.addResumeView = function() {
    this.stats.resumeViews += 1;
    if (this.resume) {
        this.resume.downloadCount += 1;
    }
    return this.save();
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
};

// Method to generate email verification token
userSchema.methods.generateVerificationToken = function() {
    const verificationToken = crypto.randomBytes(20).toString('hex');
    
    this.verificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    
    this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    return verificationToken;
};

// Add crypto import at top if not already present
import crypto from 'crypto';

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
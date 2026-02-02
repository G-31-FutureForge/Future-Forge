import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/collections.js';

const applicationSchema = new mongoose.Schema({
  // Basic Information
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required'],
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant ID is required'],
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Application Details
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Offered', 'Rejected', 'Withdrawn'],
    default: 'Applied',
  },
  
  // Resume Information
  resumeUrl: {
    type: String,
    required: false,
  },
  coverLetter: {
    type: String,
    maxlength: 2000,
    required: false,
  },

  // Applicant Information at time of application
  applicantName: String,
  applicantEmail: String,
  applicantPhone: String,
  applicantLocation: String,

  // Application Timeline
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  shortlistedDate: Date,
  interviewDate: Date,
  offerDate: Date,
  rejectionDate: Date,
  withdrawalDate: Date,

  // Ratings and Feedback
  applicantRating: {
    type: Number,
    min: 1,
    max: 5,
    required: false,
  },
  recruiterNotes: {
    type: String,
    maxlength: 1000,
    required: false,
  },
  rejectionReason: {
    type: String,
    required: false,
  },

  // Interview Details
  interviewDetails: {
    type: {
      round: String,
      date: Date,
      time: String,
      interviewer: String,
      location: String,
      meetingLink: String,
      result: String,
      feedback: String,
    },
    required: false,
  },

  // Offer Details (if applicable)
  offerDetails: {
    type: {
      salary: Number,
      currency: String,
      joiningDate: Date,
      acceptanceDeadline: Date,
      additionalBenefits: [String],
      contractTerms: String,
    },
    required: false,
  },

  // Match Score
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
    required: false,
    description: 'Skill match percentage',
  },

  // Activity Tracking
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  viewedByRecruiter: {
    type: Boolean,
    default: false,
  },
  viewedDate: Date,

}, {
  collection: COLLECTIONS.APPLICATIONS,
  timestamps: true,
});

// Indexes for better query performance
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
applicationSchema.index({ recruiterId: 1 });
applicationSchema.index({ applicantId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ appliedDate: -1 });
applicationSchema.index({ matchScore: -1 });

// Pre-save middleware to update lastUpdated
applicationSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

export default mongoose.model('Application', applicationSchema);

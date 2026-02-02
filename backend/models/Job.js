import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/collections.js';

const jobSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters'],
    minlength: [5, 'Job title must be at least 5 characters'],
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters'],
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: false,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  locationType: {
    type: String,
    enum: ['On-site', 'Remote', 'Hybrid'],
    default: 'On-site',
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    minlength: [50, 'Description must be at least 50 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  
  // Skills and Requirements
  skills: [{
    type: String,
    required: true,
    trim: true,
  }],
  requirements: {
    type: [String],
    default: [],
  },
  experience: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Years of experience required',
  },
  
  // Compensation
  salary: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  salaryRange: {
    type: {
      min: { type: Number, required: false },
      max: { type: Number, required: false },
      currency: { type: String, default: 'USD' },
    },
    required: false,
  },
  benefits: [String],
  
  // Job Classification
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    required: true,
  },
  category: {
    type: String,
    required: true,
    default: 'General',
  },
  industry: {
    type: String,
    required: false,
  },
  level: {
    type: String,
    enum: ['Entry-level', 'Mid-level', 'Senior', 'Executive'],
    default: 'Mid-level',
  },
  
  // Timeline
  postedDate: {
    type: Date,
    default: Date.now,
  },
  applicationDeadline: {
    type: Date,
    required: false,
  },
  updatedDate: {
    type: Date,
    default: Date.now,
  },
  
  // Posted By
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Status
  status: {
    type: String,
    enum: ['Open', 'Closed', 'On Hold', 'Filled'],
    default: 'Open',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Statistics
  applicationsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  viewsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Additional Information
  responsibilities: [String],
  qualifications: [String],
  perks: [String],
  tags: [String],
  
}, {
  collection: COLLECTIONS.JOBS,
  timestamps: true,
});

// Normalize salary when provided as a string like "10-15LPA" or "50000-70000"
jobSchema.pre('validate', function (next) {
  try {
    if (this.salary && typeof this.salary === 'string') {
      // Keep the original string in `salary` for display, but also try to populate `salaryRange`
      const s = this.salary.replace(/\s+/g, '');
      // Match patterns like 10-15, 100000-200000, 10LPA-15LPA, 10-15LPA
      const m = s.match(/(\d+(?:[.,]\d+)?)[^\d]*(?:-|to)[^\d]*(\d+(?:[.,]\d+)?)/i);
      if (m) {
        const parseNum = (str) => Number(String(str).replace(/,/g, '').replace(/\.(?=.*\.)/g, ''));
        const min = parseNum(m[1]);
        const max = parseNum(m[2]);
        if (!this.salaryRange) this.salaryRange = {};
        if (!isNaN(min)) this.salaryRange.min = min;
        if (!isNaN(max)) this.salaryRange.max = max;
        // Try to detect currency marker (simple heuristic)
        const currency = /\b(INR|USD|EUR|LPA|K|₹|\$|€)\b/i.exec(this.salary);
        if (currency) {
          this.salaryRange.currency = currency[0];
        }
      }
    }
  } catch (err) {
    // don't block save for normalization errors
    console.warn('Salary normalization warning:', err.message || err);
  }
  next();
});

// Index for better query performance
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ status: 1, isActive: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ postedDate: -1 });
jobSchema.index({ category: 1 });
jobSchema.index({ location: 1 });

export default mongoose.model('Job', jobSchema);
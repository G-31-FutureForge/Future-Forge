// backend/models/Company.js
import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    // Company Basic Information
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        unique: true,
        index: true
    },
    legalName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Company email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true,
        match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'Please enter a valid URL']
    },
    
    // Company Details
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    mission: {
        type: String,
        trim: true,
        maxlength: [500, 'Mission cannot exceed 500 characters']
    },
    vision: {
        type: String,
        trim: true,
        maxlength: [500, 'Vision cannot exceed 500 characters']
    },
    foundedYear: {
        type: Number,
        min: [1800, 'Invalid year'],
        max: [new Date().getFullYear(), 'Invalid year']
    },
    
    // Industry & Category
    industry: {
        type: String,
        required: [true, 'Industry is required'],
        trim: true
    },
    categories: [{
        type: String,
        trim: true
    }],
    
    // Company Size
    size: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+'],
        required: true
    },
    employeeCount: {
        type: Number,
        min: [1, 'Employee count must be at least 1']
    },
    
    // Location
    headquarters: {
        address: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            trim: true
        },
        zipCode: {
            type: String,
            trim: true
        }
    },
    locations: [{
        address: String,
        city: String,
        state: String,
        country: String,
        type: {
            type: String,
            enum: ['office', 'store', 'factory', 'remote']
        }
    }],
    
    // Media & Branding
    logo: {
        url: String,
        publicId: String
    },
    coverImage: {
        url: String,
        publicId: String
    },
    gallery: [{
        url: String,
        publicId: String,
        caption: String
    }],
    
    // Social Media
    socialMedia: {
        linkedin: {
            type: String,
            trim: true
        },
        twitter: {
            type: String,
            trim: true
        },
        facebook: {
            type: String,
            trim: true
        },
        instagram: {
            type: String,
            trim: true
        },
        github: {
            type: String,
            trim: true
        }
    },
    
    // Company Culture
    culture: {
        values: [{
            type: String,
            trim: true
        }],
        benefits: [{
            title: String,
            description: String,
            icon: String
        }],
        workEnvironment: {
            type: String,
            enum: ['On-site', 'Hybrid', 'Remote', 'Flexible']
        }
    },
    
    // Contact Information
    contactPersons: [{
        name: String,
        position: String,
        email: String,
        phone: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    
    // Company Verification
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'suspended'],
        default: 'pending'
    },
    verificationDocuments: [{
        documentType: String,
        documentUrl: String,
        verifiedAt: Date,
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    
    // Recruiters associated with this company
    recruiters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    // Company Stats
    stats: {
        totalJobsPosted: {
            type: Number,
            default: 0
        },
        activeJobs: {
            type: Number,
            default: 0
        },
        totalApplications: {
            type: Number,
            default: 0
        },
        totalEmployees: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        }
    },
    
    // Settings & Preferences
    settings: {
        allowDirectContact: {
            type: Boolean,
            default: true
        },
        showCompanyToPublic: {
            type: Boolean,
            default: true
        },
        receiveJobApplications: {
            type: Boolean,
            default: true
        },
        notificationPreferences: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            }
        }
    },
    
    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // required: true
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    deactivatedAt: Date,
    deactivatedReason: String
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for company's full address
companySchema.virtual('fullAddress').get(function() {
    const hq = this.headquarters;
    if (!hq) return '';
    return `${hq.address || ''}, ${hq.city || ''}, ${hq.state || ''}, ${hq.country || ''}`.trim();
});

// Virtual for jobs posted by company
companySchema.virtual('jobs', {
    ref: 'Job',
    localField: '_id',
    foreignField: 'company'
});

// Indexes for better query performance
companySchema.index({ name: 1 });
companySchema.index({ email: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ 'headquarters.city': 1 });
companySchema.index({ 'headquarters.country': 1 });
companySchema.index({ size: 1 });
companySchema.index({ isVerified: 1 });
companySchema.index({ isActive: 1 });

// Pre-save middleware
companySchema.pre('save', function(next) {
    // Ensure only one primary contact person
    if (this.contactPersons && this.contactPersons.length > 0) {
        const primaryContacts = this.contactPersons.filter(person => person.isPrimary);
        if (primaryContacts.length > 1) {
            // Keep only the first one as primary
            for (let i = 1; i < primaryContacts.length; i++) {
                primaryContacts[i].isPrimary = false;
            }
        }
    }
    next();
});

// Static method to find companies by industry
companySchema.statics.findByIndustry = function(industry) {
    return this.find({ 
        industry: new RegExp(industry, 'i'),
        isActive: true,
        isVerified: true 
    });
};

// Static method to get company statistics
companySchema.statics.getStatistics = async function() {
    const stats = await this.aggregate([
        {
            $match: { isActive: true }
        },
        {
            $group: {
                _id: null,
                totalCompanies: { $sum: 1 },
                verifiedCompanies: { 
                    $sum: { $cond: [{ $eq: ["$isVerified", true] }, 1, 0] }
                },
                avgEmployeeCount: { $avg: "$employeeCount" },
                industries: { $addToSet: "$industry" }
            }
        }
    ]);
    
    return stats[0] || {
        totalCompanies: 0,
        verifiedCompanies: 0,
        avgEmployeeCount: 0,
        industries: []
    };
};

// Instance method to get company summary
companySchema.methods.getSummary = function() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        industry: this.industry,
        size: this.size,
        headquarters: this.headquarters,
        logo: this.logo?.url,
        description: this.description?.substring(0, 150) + (this.description?.length > 150 ? '...' : ''),
        isVerified: this.isVerified,
        stats: this.stats
    };
};

// Instance method to add recruiter
companySchema.methods.addRecruiter = function(recruiterId) {
    if (!this.recruiters.includes(recruiterId)) {
        this.recruiters.push(recruiterId);
    }
    return this.save();
};

// Instance method to remove recruiter
companySchema.methods.removeRecruiter = function(recruiterId) {
    this.recruiters = this.recruiters.filter(id => id.toString() !== recruiterId.toString());
    return this.save();
};

const Company = mongoose.models.Company || mongoose.model('Company', companySchema);
export default Company;
// backend/controllers/jobPostController.js
import JobPost from '../models/JobPost.js';
import User from '../models/User.js';
import Company from '../models/Company.js';

// @desc    Create a new job post (recruiter)
// @route   POST /api/job-posts
// @access  Private (recruiter only)
export const createJobPost = async (req, res) => {
    try {
        const {
            title,
            description,
            company,
            location,
            locationType,
            jobType,
            experienceLevel,
            numberOfPositions,
            salary,
            benefits,
            requiredSkills,
            preferredSkills,
            qualifications,
            requirements,
            responsibilities,
            minEducation,
            applicationDeadline,
            tags,
            category,
            department,
            reportingTo,
            status
        } = req.body;

        // Validate required fields
        if (!title || !description || !company || !location || !jobType || !experienceLevel || !minEducation) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: title, description, company, location, jobType, experienceLevel, minEducation'
            });
        }

        // Verify company exists
        const companyExists = await Company.findById(company);
        if (!companyExists) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Create job post
        const jobPost = new JobPost({
            title,
            description,
            company,
            location,
            locationType: locationType || 'on-site',
            jobType,
            experienceLevel,
            numberOfPositions: numberOfPositions || 1,
            salary: salary || {},
            benefits: benefits || [],
            requiredSkills: requiredSkills || [],
            preferredSkills: preferredSkills || [],
            qualifications: qualifications || [],
            requirements: requirements || [],
            responsibilities: responsibilities || [],
            minEducation,
            applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
            postedBy: req.user._id,
            tags: tags || [],
            category: category || '',
            department: department || '',
            reportingTo: reportingTo || '',
            status: status || 'draft'
        });

        await jobPost.save();

        res.status(201).json({
            success: true,
            message: 'Job post created successfully',
            data: jobPost
        });
    } catch (error) {
        console.error('Create job post error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating job post'
        });
    }
};

// @desc    Get all job posts (public)
// @route   GET /api/job-posts
// @access  Public
export const getAllJobPosts = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = 'published', sort = '-postedAt' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const filter = { status: status || 'published', isActive: true };

        const [jobPosts, total] = await Promise.all([
            JobPost.find(filter)
                .populate('company', 'name email website industry')
                .populate('postedBy', 'firstName lastName email')
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            JobPost.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: jobPosts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Get all job posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching job posts'
        });
    }
};

// @desc    Get a single job post
// @route   GET /api/job-posts/:id
// @access  Public
export const getJobPost = async (req, res) => {
    try {
        const jobPost = await JobPost.findByIdAndUpdate(
            req.params.id,
            { $inc: { viewCount: 1 } },
            { new: true }
        )
            .populate('company', 'name email website industry description')
            .populate('postedBy', 'firstName lastName email')
            .populate('applications.candidateId', 'firstName lastName email studentProfile');

        if (!jobPost) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        res.status(200).json({
            success: true,
            data: jobPost
        });
    } catch (error) {
        console.error('Get job post error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching job post'
        });
    }
};

// @desc    Get my job posts (recruiter)
// @route   GET /api/job-posts/recruiter/my-jobs
// @access  Private (recruiter)
export const getMyJobPosts = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, sort = '-postedAt' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const filter = { postedBy: req.user._id };
        if (status) filter.status = status;

        const [jobPosts, total] = await Promise.all([
            JobPost.find(filter)
                .populate('company', 'name email website')
                .sort(sort)
                .skip(skip)
                .limit(Number(limit)),
            JobPost.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: jobPosts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Get my job posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your job posts'
        });
    }
};

// @desc    Update a job post
// @route   PUT /api/job-posts/:id
// @access  Private (job post creator)
export const updateJobPost = async (req, res) => {
    try {
        let jobPost = await JobPost.findById(req.params.id);

        if (!jobPost) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        // Check if user is the creator
        if (jobPost.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this job post'
            });
        }

        // Update fields
        const updateData = { ...req.body };
        delete updateData.postedBy; // Prevent changing the poster
        delete updateData.applications; // Prevent changing applications

        jobPost = await JobPost.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Job post updated successfully',
            data: jobPost
        });
    } catch (error) {
        console.error('Update job post error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating job post'
        });
    }
};

// @desc    Delete a job post
// @route   DELETE /api/job-posts/:id
// @access  Private (job post creator)
export const deleteJobPost = async (req, res) => {
    try {
        const jobPost = await JobPost.findById(req.params.id);

        if (!jobPost) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        // Check if user is the creator
        if (jobPost.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this job post'
            });
        }

        await JobPost.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Job post deleted successfully'
        });
    } catch (error) {
        console.error('Delete job post error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting job post'
        });
    }
};

// @desc    Search and filter job posts
// @route   GET /api/job-posts/search/advanced
// @access  Public
export const searchJobPosts = async (req, res) => {
    try {
        const {
            query,
            location,
            jobType,
            experienceLevel,
            minSalary,
            maxSalary,
            company,
            category,
            locationType,
            page = 1,
            limit = 20
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const filter = { status: 'published', isActive: true };

        // Text search
        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } },
                { 'requiredSkills.skill': { $regex: query, $options: 'i' } }
            ];
        }

        // Location filter
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        // Job type filter
        if (jobType) {
            filter.jobType = jobType;
        }

        // Experience level filter
        if (experienceLevel) {
            filter.experienceLevel = experienceLevel;
        }

        // Location type filter
        if (locationType) {
            filter.locationType = locationType;
        }

        // Salary range filter
        if (minSalary || maxSalary) {
            filter.$and = [];
            if (minSalary) {
                filter.$and.push({ 'salary.max': { $gte: Number(minSalary) } });
            }
            if (maxSalary) {
                filter.$and.push({ 'salary.min': { $lte: Number(maxSalary) } });
            }
        }

        // Company filter
        if (company) {
            filter.company = company;
        }

        // Category filter
        if (category) {
            filter.category = { $regex: category, $options: 'i' };
        }

        const [jobPosts, total] = await Promise.all([
            JobPost.find(filter)
                .populate('company', 'name email website industry')
                .populate('postedBy', 'firstName lastName')
                .sort('-postedAt')
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            JobPost.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: jobPosts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Search job posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching job posts'
        });
    }
};

// @desc    Apply for a job
// @route   POST /api/job-posts/:id/apply
// @access  Private (student)
export const applyForJob = async (req, res) => {
    try {
        const { resume, coverLetter } = req.body;
        const jobPostId = req.params.id;

        const jobPost = await JobPost.findById(jobPostId);
        if (!jobPost) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        // Check if already applied
        const alreadyApplied = jobPost.applications.some(
            app => app.candidateId.toString() === req.user._id.toString()
        );

        if (alreadyApplied) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this job'
            });
        }

        // Add application
        jobPost.applications.push({
            candidateId: req.user._id,
            resume: resume || '',
            coverLetter: coverLetter || '',
            appliedAt: new Date()
        });

        await jobPost.save();

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: jobPost
        });
    } catch (error) {
        console.error('Apply for job error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting application'
        });
    }
};

// @desc    Get applications for a job post
// @route   GET /api/job-posts/:id/applications
// @access  Private (job post creator)
export const getJobApplications = async (req, res) => {
    try {
        const jobPost = await JobPost.findById(req.params.id)
            .populate('applications.candidateId', 'firstName lastName email phone studentProfile');

        if (!jobPost) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        // Check authorization
        if (jobPost.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view applications'
            });
        }

        res.status(200).json({
            success: true,
            data: jobPost.applications,
            totalApplications: jobPost.totalApplications
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching applications'
        });
    }
};

// @desc    Update application status
// @route   PUT /api/job-posts/:id/applications/:appId
// @access  Private (job post creator)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status, notes, ratings } = req.body;
        const { id: jobPostId, appId } = req.params;

        const jobPost = await JobPost.findById(jobPostId);
        if (!jobPost) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        // Check authorization
        if (jobPost.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update applications'
            });
        }

        const application = jobPost.applications.id(appId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Update application
        if (status) application.status = status;
        if (notes) application.notes = notes;
        if (ratings) application.ratings = ratings;

        await jobPost.save();

        res.status(200).json({
            success: true,
            message: 'Application updated successfully',
            data: application
        });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating application'
        });
    }
};

// @desc    Close a job post
// @route   PUT /api/job-posts/:id/close
// @access  Private (job post creator)
export const closeJobPost = async (req, res) => {
    try {
        const jobPost = await JobPost.findById(req.params.id);

        if (!jobPost) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        // Check authorization
        if (jobPost.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to close this job post'
            });
        }

        jobPost.status = 'closed';
        jobPost.closedAt = new Date();
        jobPost.isActive = false;
        await jobPost.save();

        res.status(200).json({
            success: true,
            message: 'Job post closed successfully',
            data: jobPost
        });
    } catch (error) {
        console.error('Close job post error:', error);
        res.status(500).json({
            success: false,
            message: 'Error closing job post'
        });
    }
};

// @desc    Publish a job post (change from draft to published)
// @route   PUT /api/job-posts/:id/publish
// @access  Private (job post creator)
export const publishJobPost = async (req, res) => {
    try {
        const jobPost = await JobPost.findById(req.params.id);

        if (!jobPost) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        // Check authorization
        if (jobPost.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to publish this job post'
            });
        }

        jobPost.status = 'published';
        jobPost.isActive = true;
        await jobPost.save();

        res.status(200).json({
            success: true,
            message: 'Job post published successfully',
            data: jobPost
        });
    } catch (error) {
        console.error('Publish job post error:', error);
        res.status(500).json({
            success: false,
            message: 'Error publishing job post'
        });
    }
};

// @desc    Get job post statistics (for recruiter)
// @route   GET /api/job-posts/:id/statistics
// @access  Private (job post creator)
export const getJobPostStats = async (req, res) => {
    try {
        const jobPost = await JobPost.findById(req.params.id);

        if (!jobPost) {
            return res.status(404).json({
                success: false,
                message: 'Job post not found'
            });
        }

        // Check authorization
        if (jobPost.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view statistics'
            });
        }

        const stats = {
            totalApplications: jobPost.totalApplications,
            viewCount: jobPost.viewCount,
            applicationsByStatus: {
                pending: jobPost.applications.filter(a => a.status === 'pending').length,
                shortlisted: jobPost.applications.filter(a => a.status === 'shortlisted').length,
                rejected: jobPost.applications.filter(a => a.status === 'rejected').length,
                interviewed: jobPost.applications.filter(a => a.status === 'interviewed').length,
                offered: jobPost.applications.filter(a => a.status === 'offered').length
            },
            postedAt: jobPost.postedAt,
            daysSincePosted: Math.floor((new Date() - jobPost.postedAt) / (1000 * 60 * 60 * 24))
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
};

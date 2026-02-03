import Job from '../models/Job.js';
import User from '../models/User.js';

// Get recruiter-posted jobs for candidate portal (public, no auth required)
export const getRecruiterPostedJobs = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const filter = { 
      isActive: true, 
      status: 'Open',
      postedBy: { $exists: true, $ne: null }
    };
    
    const jobs = await Job.find(filter)
      .populate('postedBy', 'name firstName lastName email companyName')
      .sort({ postedDate: -1 })
      .limit(Math.min(parseInt(limit) || 100, 200))
      .lean();
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error('getRecruiterPostedJobs error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching recruiter jobs', 
      error: error.message 
    });
  }
};

// Get all jobs with pagination and filters
export const getAllJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'Open', category, location, level } = req.query;
    
    const filter = { isActive: true };
    
    if (status) filter.status = status;
    if (category) filter.category = new RegExp(category, 'i');
    if (location) filter.location = new RegExp(location, 'i');
    if (level) filter.level = level;
    
    console.log('getAllJobs - Filter:', JSON.stringify(filter));
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email companyName')
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Job.countDocuments(filter);
    
    console.log(`getAllJobs - Found ${jobs.length} jobs out of ${total} total matching filter`);
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: jobs,
    });
  } catch (error) {
    console.error('getAllJobs error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching jobs', 
      error: error.message 
    });
  }
};

// Get a single job by ID
export const getJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).populate('postedBy', 'name email companyName');
    
    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching job', 
      error: error.message 
    });
  }
};

// Create a new job posting
export const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      locationType,
      description,
      skills,
      requirements,
      experience,
      salary,
      benefits,
      jobType,
      category,
      industry,
      level,
      applicationDeadline,
      responsibilities,
      qualifications,
      perks,
      tags,
    } = req.body;
    
    // Validate required fields
    if (!title || !company || !location || !description || !skills || !jobType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }
    
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to create job',
      });
    }
    
    const jobData = {
      title,
      company,
      location,
      locationType: locationType || 'On-site',
      description,
      skills: Array.isArray(skills) ? skills : [skills],
      requirements: requirements || [],
      experience: experience || 0,
      salary,
      benefits: benefits || [],
      jobType,
      category: category || 'General',
      industry,
      level: level || 'Mid-level',
      applicationDeadline,
      responsibilities: responsibilities || [],
      qualifications: qualifications || [],
      perks: perks || [],
      tags: tags || [],
      postedBy: req.user._id,
      status: 'Open',
    };
    
    const job = new Job(jobData);
    await job.save();
    
    // Populate user info before responding
    await job.populate('postedBy', 'name email companyName');
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job,
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error creating job', 
      error: error.message 
    });
  }
};

// Update a job posting
export const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Check if job exists and belongs to user
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }
    
    // Authorization check - only recruiter who posted can update
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this job' 
      });
    }
    
    // Update fields
    const allowedFields = [
      'title', 'company', 'location', 'locationType', 'description',
      'skills', 'requirements', 'experience', 'salary', 'benefits',
      'jobType', 'category', 'industry', 'level', 'applicationDeadline',
      'status', 'responsibilities', 'qualifications', 'perks', 'tags'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });
    
    job.updatedDate = Date.now();
    await job.save();
    
    await job.populate('postedBy', 'name email companyName');
    
    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job,
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error updating job', 
      error: error.message 
    });
  }
};

// Delete a job posting
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }
    
    // Authorization check
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this job' 
      });
    }
    
    await Job.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ 
      success: true,
      message: 'Job deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting job', 
      error: error.message 
    });
  }
};

// Search and filter jobs
export const searchJobs = async (req, res) => {
  try {
    const { 
      query, 
      location, 
      jobType, 
      category, 
      level,
      minSalary,
      maxSalary,
      page = 1,
      limit = 10,
      skills,
      sortBy = 'postedDate',
    } = req.query;
    
    const searchQuery = { isActive: true, status: 'Open' };
    
    // Text search
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { skills: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Filters
    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' };
    }
    
    if (jobType) {
      searchQuery.jobType = jobType;
    }
    
    if (category) {
      searchQuery.category = { $regex: category, $options: 'i' };
    }
    
    if (level) {
      searchQuery.level = level;
    }
    
    // Salary range filter - support both `salaryRange` and legacy `salary` subdocument
    if (minSalary || maxSalary) {
      const min = minSalary ? parseInt(minSalary) : undefined;
      const max = maxSalary ? parseInt(maxSalary) : undefined;
      const salaryAnd = [];
      if (min !== undefined) {
        salaryAnd.push({ $or: [ { 'salaryRange.min': { $gte: min } }, { 'salary.min': { $gte: min } } ] });
      }
      if (max !== undefined) {
        salaryAnd.push({ $or: [ { 'salaryRange.max': { $lte: max } }, { 'salary.max': { $lte: max } } ] });
      }
      if (salaryAnd.length === 1) {
        Object.assign(searchQuery, salaryAnd[0]);
      } else if (salaryAnd.length > 1) {
        searchQuery.$and = salaryAnd;
      }
    }
    
    // Skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      searchQuery.skills = { $in: skillsArray };
    }
    
    // Sorting
    const sortObject = {};
    switch(sortBy) {
      case 'salary':
        // Prefer `salaryRange.max`, but include legacy `salary.max` as fallback
        sortObject['salaryRange.max'] = -1;
        sortObject['salary.max'] = -1;
        break;
      case 'views':
        sortObject.viewsCount = -1;
        break;
      case 'recent':
      default:
        sortObject.postedDate = -1;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const jobs = await Job.find(searchQuery)
      .populate('postedBy', 'name email companyName')
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Job.countDocuments(searchQuery);
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error searching jobs', 
      error: error.message 
    });
  }
};

// Get jobs posted by current user (recruiter)
export const getMyJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { postedBy: req.user._id };
    if (status) filter.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const jobs = await Job.find(filter)
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Job.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching your jobs', 
      error: error.message 
    });
  }
};

// Toggle job status (Open/Closed)
export const toggleJobStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }
    
    // Authorization check
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this job' 
      });
    }
    
    const { status } = req.body;
    
    if (!['Open', 'Closed', 'On Hold', 'Filled'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status' 
      });
    }
    
    job.status = status;
    await job.save();
    
    res.status(200).json({
      success: true,
      message: `Job status updated to ${status}`,
      data: job,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating job status', 
      error: error.message 
    });
  }
};

// Get job statistics
export const getJobStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ isActive: true });
    const openJobs = await Job.countDocuments({ status: 'Open', isActive: true });
    const closedJobs = await Job.countDocuments({ status: 'Closed', isActive: true });
    
    const jobsByCategory = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const jobsByLevel = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        openJobs,
        closedJobs,
        jobsByCategory,
        jobsByLevel,
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching job statistics', 
      error: error.message 
    });
  }
};
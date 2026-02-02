import Job from '../models/Job.js';
import Application from '../models/Application.js';

// Create a new job
export const createJobService = async (jobData) => {
  try {
    const job = new Job(jobData);
    await job.save();
    return job;
  } catch (error) {
    throw new Error(`Failed to create job: ${error.message}`);
  }
};

// Get all jobs with filters
export const getAllJobsService = async (filters = {}, pagination = {}) => {
  try {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const jobs = await Job.find(filters)
      .populate('postedBy', 'name email companyName')
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(filters);

    return {
      jobs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }
};

// Get single job
export const getJobService = async (jobId) => {
  try {
    const job = await Job.findByIdAndUpdate(
      jobId,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).populate('postedBy', 'name email companyName');

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  } catch (error) {
    throw new Error(`Failed to fetch job: ${error.message}`);
  }
};

// Update job
export const updateJobService = async (jobId, userId, updateData) => {
  try {
    const job = await Job.findById(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    // Check authorization
    if (job.postedBy.toString() !== userId.toString()) {
      throw new Error('Not authorized to update this job');
    }

    const allowedFields = [
      'title', 'company', 'location', 'locationType', 'description',
      'skills', 'requirements', 'experience', 'salary', 'benefits',
      'jobType', 'category', 'industry', 'level', 'applicationDeadline',
      'status', 'responsibilities', 'qualifications', 'perks', 'tags'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        job[field] = updateData[field];
      }
    });

    job.updatedDate = Date.now();
    await job.save();

    return job;
  } catch (error) {
    throw new Error(`Failed to update job: ${error.message}`);
  }
};

// Delete job
export const deleteJobService = async (jobId, userId) => {
  try {
    const job = await Job.findById(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.postedBy.toString() !== userId.toString()) {
      throw new Error('Not authorized to delete this job');
    }

    await Job.findByIdAndDelete(jobId);
    return { message: 'Job deleted successfully' };
  } catch (error) {
    throw new Error(`Failed to delete job: ${error.message}`);
  }
};

// Search jobs
export const searchJobsService = async (searchFilters = {}, pagination = {}) => {
  try {
    const { query, location, jobType, category, level, minSalary, maxSalary, skills, sortBy = 'postedDate' } = searchFilters;
    const { page = 1, limit = 10 } = pagination;

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

    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      searchQuery.skills = { $in: skillsArray };
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

    const sortObject = {};
    if (sortBy === 'salary') {
      sortObject['salaryRange.max'] = -1;
      sortObject['salary.max'] = -1;
    } else if (sortBy === 'views') {
      sortObject.viewsCount = -1;
    } else {
      sortObject.postedDate = -1;
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(searchQuery)
      .populate('postedBy', 'name email companyName')
      .sort(sortObject)
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(searchQuery);

    return {
      jobs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(`Failed to search jobs: ${error.message}`);
  }
};

// Get user's job postings
export const getUserJobsService = async (userId, pagination = {}) => {
  try {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const jobs = await Job.find({ postedBy: userId })
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments({ postedBy: userId });

    return {
      jobs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(`Failed to fetch user jobs: ${error.message}`);
  }
};

// Update job status
export const updateJobStatusService = async (jobId, userId, status) => {
  try {
    const job = await Job.findById(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.postedBy.toString() !== userId.toString()) {
      throw new Error('Not authorized to update this job');
    }

    if (!['Open', 'Closed', 'On Hold', 'Filled'].includes(status)) {
      throw new Error('Invalid status');
    }

    job.status = status;
    await job.save();

    return job;
  } catch (error) {
    throw new Error(`Failed to update job status: ${error.message}`);
  }
};

// Get job statistics
export const getJobStatsService = async (filters = {}) => {
  try {
    const defaultFilters = { isActive: true };
    const mergedFilters = { ...defaultFilters, ...filters };

    const totalJobs = await Job.countDocuments(mergedFilters);
    const openJobs = await Job.countDocuments({ ...mergedFilters, status: 'Open' });
    const closedJobs = await Job.countDocuments({ ...mergedFilters, status: 'Closed' });
    const onHoldJobs = await Job.countDocuments({ ...mergedFilters, status: 'On Hold' });
    const filledJobs = await Job.countDocuments({ ...mergedFilters, status: 'Filled' });

    const jobsByCategory = await Job.aggregate([
      { $match: mergedFilters },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const jobsByLevel = await Job.aggregate([
      { $match: mergedFilters },
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);

    const jobsByType = await Job.aggregate([
      { $match: mergedFilters },
      { $group: { _id: '$jobType', count: { $sum: 1 } } }
    ]);

    const topMostApplied = await Job.find(mergedFilters)
      .sort({ applicationsCount: -1 })
      .limit(5)
      .select('title company applicationsCount');

    return {
      totalJobs,
      openJobs,
      closedJobs,
      onHoldJobs,
      filledJobs,
      jobsByCategory,
      jobsByLevel,
      jobsByType,
      topMostApplied,
    };
  } catch (error) {
    throw new Error(`Failed to fetch job statistics: ${error.message}`);
  }
};

// Recommend jobs based on skills
export const recommendJobsService = async (userSkills = []) => {
  try {
    const jobs = await Job.find({
      isActive: true,
      status: 'Open',
      skills: { $in: userSkills }
    })
      .populate('postedBy', 'name email companyName')
      .sort({ postedDate: -1 })
      .limit(10);

    return jobs;
  } catch (error) {
    throw new Error(`Failed to get job recommendations: ${error.message}`);
  }
};

// Update application count
export const updateApplicationCountService = async (jobId, increment = true) => {
  try {
    const update = increment ? { $inc: { applicationsCount: 1 } } : { $inc: { applicationsCount: -1 } };
    const job = await Job.findByIdAndUpdate(jobId, update, { new: true });
    return job;
  } catch (error) {
    throw new Error(`Failed to update application count: ${error.message}`);
  }
};

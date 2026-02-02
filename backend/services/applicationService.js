import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

// Submit application
export const submitApplicationService = async (jobId, applicantId, applicationData) => {
  try {
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      applicantId,
    });

    if (existingApplication) {
      throw new Error('You have already applied for this job');
    }

    const application = new Application({
      ...applicationData,
      jobId,
      applicantId,
      recruiterId: job.postedBy,
    });

    await application.save();
    return application;
  } catch (error) {
    throw new Error(`Failed to submit application: ${error.message}`);
  }
};

// Get applications for a job
export const getJobApplicationsService = async (jobId, recruiterId, pagination = {}, filters = {}) => {
  try {
    // Verify recruiter owns the job
    const job = await Job.findById(jobId);
    if (!job || job.postedBy.toString() !== recruiterId.toString()) {
      throw new Error('Not authorized to view applications for this job');
    }

    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const queryFilter = { jobId, ...filters };

    const applications = await Application.find(queryFilter)
      .populate('applicantId', 'name email skills phone')
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(queryFilter);

    return {
      applications,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }
};

// Get applicant's applications
export const getApplicantApplicationsService = async (applicantId, pagination = {}, filters = {}) => {
  try {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const queryFilter = { applicantId, ...filters };

    const applications = await Application.find(queryFilter)
      .populate('jobId', 'title company location salary jobType')
      .populate('recruiterId', 'name email companyName')
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(queryFilter);

    return {
      applications,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }
};

// Get single application
export const getApplicationService = async (applicationId, userId) => {
  try {
    const application = await Application.findById(applicationId)
      .populate('jobId')
      .populate('applicantId', 'name email skills experience education');

    if (!application) {
      throw new Error('Application not found');
    }

    // Check authorization
    const isRecruiter = application.recruiterId.toString() === userId.toString();
    const isApplicant = application.applicantId._id.toString() === userId.toString();

    if (!isRecruiter && !isApplicant) {
      throw new Error('Not authorized to view this application');
    }

    return application;
  } catch (error) {
    throw new Error(`Failed to fetch application: ${error.message}`);
  }
};

// Update application status
export const updateApplicationStatusService = async (applicationId, recruiterId, updateData) => {
  try {
    const application = await Application.findById(applicationId);

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.recruiterId.toString() !== recruiterId.toString()) {
      throw new Error('Not authorized to update this application');
    }

    const { status, notes, rating, interviewDetails, offerDetails } = updateData;

    if (status) {
      const validStatuses = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Offered', 'Rejected', 'Withdrawn'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }
      application.status = status;
    }

    if (notes) application.recruiterNotes = notes;
    if (rating) application.applicantRating = rating;
    if (interviewDetails) application.interviewDetails = interviewDetails;
    if (offerDetails) application.offerDetails = offerDetails;

    await application.save();
    return application;
  } catch (error) {
    throw new Error(`Failed to update application: ${error.message}`);
  }
};

// Withdraw application
export const withdrawApplicationService = async (applicationId, applicantId) => {
  try {
    const application = await Application.findById(applicationId);

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.applicantId.toString() !== applicantId.toString()) {
      throw new Error('Not authorized to withdraw this application');
    }

    application.status = 'Withdrawn';
    application.withdrawalDate = Date.now();
    await application.save();

    return application;
  } catch (error) {
    throw new Error(`Failed to withdraw application: ${error.message}`);
  }
};

// Schedule interview
export const scheduleInterviewService = async (applicationId, recruiterId, interviewData) => {
  try {
    const application = await Application.findById(applicationId);

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.recruiterId.toString() !== recruiterId.toString()) {
      throw new Error('Not authorized to schedule interview');
    }

    application.interviewDetails = interviewData;
    application.status = 'Interview Scheduled';
    await application.save();

    return application;
  } catch (error) {
    throw new Error(`Failed to schedule interview: ${error.message}`);
  }
};

// Get recruiter statistics
export const getRecruiterStatsService = async (recruiterId) => {
  try {
    const jobs = await Job.find({ postedBy: recruiterId });
    const jobIds = jobs.map(job => job._id);

    const stats = {
      totalJobs: jobs.length,
      totalApplications: await Application.countDocuments({ jobId: { $in: jobIds } }),
      shortlistedApplications: await Application.countDocuments({
        jobId: { $in: jobIds },
        status: 'Shortlisted',
      }),
      rejectedApplications: await Application.countDocuments({
        jobId: { $in: jobIds },
        status: 'Rejected',
      }),
      offeredApplications: await Application.countDocuments({
        jobId: { $in: jobIds },
        status: 'Offered',
      }),
      withdrawnApplications: await Application.countDocuments({
        jobId: { $in: jobIds },
        status: 'Withdrawn',
      }),
    };

    const applicationsByJob = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const recentApplications = await Application.find({ jobId: { $in: jobIds } })
      .sort({ appliedDate: -1 })
      .limit(10)
      .populate('applicantId', 'name email')
      .populate('jobId', 'title');

    return {
      ...stats,
      applicationsByJob,
      recentApplications,
    };
  } catch (error) {
    throw new Error(`Failed to fetch recruiter statistics: ${error.message}`);
  }
};

// Calculate match score between applicant and job
export const calculateMatchScoreService = (applicantSkills = [], jobSkills = []) => {
  if (!jobSkills || jobSkills.length === 0) return 0;

  const applicantSkillsLower = applicantSkills.map(skill =>
    typeof skill === 'string' ? skill.toLowerCase() : skill.name?.toLowerCase()
  );

  const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase());

  const matchedSkills = applicantSkillsLower.filter(skill =>
    jobSkillsLower.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
  ).length;

  return Math.round((matchedSkills / jobSkillsLower.length) * 100);
};

// Get applications by status
export const getApplicationsByStatusService = async (recruiterId, jobId, status) => {
  try {
    const filter = { status, jobId };

    const job = await Job.findById(jobId);
    if (!job || job.postedBy.toString() !== recruiterId.toString()) {
      throw new Error('Not authorized to view applications for this job');
    }

    const applications = await Application.find(filter)
      .populate('applicantId', 'name email phone')
      .sort({ appliedDate: -1 });

    return applications;
  } catch (error) {
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }
};

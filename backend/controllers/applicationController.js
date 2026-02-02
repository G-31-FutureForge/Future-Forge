import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { updateApplicationCountService } from '../services/jobService.js';

// Apply for a job
export const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, resumeUrl } = req.body;
    const applicantId = req.user._id;

    // Validate job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      applicantId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job',
      });
    }

    // Get applicant details
    const applicant = await User.findById(applicantId);

    const applicationData = {
      jobId,
      applicantId,
      recruiterId: job.postedBy,
      status: 'Applied',
      coverLetter,
      resumeUrl: resumeUrl || applicant.resumeUrl,
      applicantName: applicant.name,
      applicantEmail: applicant.email,
      applicantPhone: applicant.phone,
      applicantLocation: applicant.location,
      matchScore: calculateMatchScore(applicant.skills, job.skills),
    };

    const application = new Application(applicationData);
    await application.save();

    // Update job application count
    await updateApplicationCountService(jobId, true);

    // Populate references
    await application.populate('jobId', 'title company');
    await application.populate('applicantId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message,
    });
  }
};

// Get all applications for a job (recruiter)
export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10, status, sortBy = 'appliedDate' } = req.query;

    // Verify job exists and belongs to user
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job',
      });
    }

    const filter = { jobId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sortObject = {};
    if (sortBy === 'rating') {
      sortObject.applicantRating = -1;
    } else if (sortBy === 'matchScore') {
      sortObject.matchScore = -1;
    } else {
      sortObject.appliedDate = -1;
    }

    const applications = await Application.find(filter)
      .populate('applicantId', 'name email skills phone')
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(filter);

    // Mark as viewed
    await Application.updateMany(
      { _id: { $in: applications.map(app => app._id) } },
      { viewedByRecruiter: true, viewedDate: Date.now() }
    );

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message,
    });
  }
};

// Get applicant's applications
export const getMyApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const applicantId = req.user._id;

    const filter = { applicantId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(filter)
      .populate('jobId', 'title company location salary jobType')
      .populate('recruiterId', 'name email companyName')
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your applications',
      error: error.message,
    });
  }
};

// Get single application
export const getApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate('jobId')
      .populate('applicantId', 'name email skills experience education');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Authorization check
    const isRecruiter = application.recruiterId.toString() === req.user._id.toString();
    const isApplicant = application.applicantId._id.toString() === req.user._id.toString();

    if (!isRecruiter && !isApplicant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application',
      });
    }

    // Mark as viewed if recruiter
    if (isRecruiter) {
      application.viewedByRecruiter = true;
      application.viewedDate = Date.now();
      await application.save();
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message,
    });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes, rating } = req.body;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Authorization check
    if (application.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application',
      });
    }

    // Validate status
    const validStatuses = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Offered', 'Rejected', 'Withdrawn'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    // Update status and corresponding date
    if (status) {
      application.status = status;

      switch (status) {
        case 'Shortlisted':
          application.shortlistedDate = Date.now();
          break;
        case 'Interview Scheduled':
          application.interviewDate = Date.now();
          break;
        case 'Offered':
          application.offerDate = Date.now();
          break;
        case 'Rejected':
          application.rejectionDate = Date.now();
          break;
        case 'Withdrawn':
          application.withdrawalDate = Date.now();
          break;
      }
    }

    if (notes) application.recruiterNotes = notes;
    if (rating) application.applicantRating = rating;

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating application',
      error: error.message,
    });
  }
};

// Withdraw application (by applicant)
export const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const applicantId = req.user._id;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.applicantId.toString() !== applicantId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application',
      });
    }

    application.status = 'Withdrawn';
    application.withdrawalDate = Date.now();
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error withdrawing application',
      error: error.message,
    });
  }
};

// Schedule interview
export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { date, time, interviewer, location, meetingLink } = req.body;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to schedule interview',
      });
    }

    application.interviewDetails = {
      date,
      time,
      interviewer,
      location,
      meetingLink,
    };

    application.status = 'Interview Scheduled';
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error scheduling interview',
      error: error.message,
    });
  }
};

// Get recruiter dashboard stats
export const getRecruiterStats = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    // Get recruiter's jobs
    const jobs = await Job.find({ postedBy: recruiterId });
    const jobIds = jobs.map(job => job._id);

    // Get applications for those jobs
    const totalApplications = await Application.countDocuments({ jobId: { $in: jobIds } });
    const shortlistedApplications = await Application.countDocuments({ 
      jobId: { $in: jobIds }, 
      status: 'Shortlisted' 
    });
    const rejectedApplications = await Application.countDocuments({ 
      jobId: { $in: jobIds }, 
      status: 'Rejected' 
    });
    const offeredApplications = await Application.countDocuments({ 
      jobId: { $in: jobIds }, 
      status: 'Offered' 
    });

    const applicationsByJob = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const recentApplications = await Application.find({ jobId: { $in: jobIds } })
      .sort({ appliedDate: -1 })
      .limit(5)
      .populate('applicantId', 'name email')
      .populate('jobId', 'title');

    res.status(200).json({
      success: true,
      data: {
        totalJobs: jobs.length,
        totalApplications,
        shortlistedApplications,
        rejectedApplications,
        offeredApplications,
        applicationsByJob,
        recentApplications,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recruiter stats',
      error: error.message,
    });
  }
};

// Helper function to calculate match score
const calculateMatchScore = (applicantSkills = [], jobSkills = []) => {
  if (!jobSkills || jobSkills.length === 0) return 0;

  const applicantSkillsLower = applicantSkills.map(skill => skill.name?.toLowerCase() || skill.toLowerCase());
  const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase());

  const matchedSkills = applicantSkillsLower.filter(skill =>
    jobSkillsLower.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
  ).length;

  return Math.round((matchedSkills / jobSkillsLower.length) * 100);
};

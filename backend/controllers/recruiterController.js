// backend/controllers/recruiterController.js
import Job from '../models/Job.js';
import User from '../models/User.js';

// @desc    Create a new job (recruiter)
// @route   POST /api/recruiter/jobs
// @access  Private (recruiter only)
export const createJob = async (req, res) => {
  try {
    const { title, company, location, description, skills, requirements, salary, jobType, applicationDeadline } = req.body;

    if (!title || !company || !location || !description || !jobType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, company, location, description, and jobType',
      });
    }

    const job = await Job.create({
      title,
      company,
      location,
      description,
      skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
      requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
      salary: salary || undefined,
      jobType,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
      postedBy: req.user._id,
      status: 'Open',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: job,
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating job',
    });
  }
};

// @desc    Get all jobs posted by this recruiter
// @route   GET /api/recruiter/jobs
// @access  Private (recruiter only)
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ postedDate: -1 });
    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
    });
  }
};

// @desc    Get all candidates (students)
// @route   GET /api/recruiter/candidates
// @access  Private (recruiter only)
export const getAllCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [candidates, total] = await Promise.all([
      User.find({ userType: 'student', isActive: true })
        .select('firstName lastName email phone studentProfile skills education createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments({ userType: 'student', isActive: true }),
    ]);

    res.status(200).json({
      success: true,
      data: candidates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching candidates',
    });
  }
};

// @desc    Search candidates by name, email, or skills
// @route   GET /api/recruiter/candidates/search
// @access  Private (recruiter only)
export const searchCandidates = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = { userType: 'student', isActive: true };

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { 'studentProfile.headline': searchRegex },
        { 'studentProfile.summary': searchRegex },
        { 'skills.name': searchRegex },
      ];
    }

    const [candidates, total] = await Promise.all([
      User.find(filter)
        .select('firstName lastName email phone studentProfile skills education createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: candidates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Search candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching candidates',
    });
  }
};

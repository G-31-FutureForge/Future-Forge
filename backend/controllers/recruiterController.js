// backend/controllers/recruiterController.js
import Job from '../models/Job.js';
import User from '../models/User.js';
import Candidate from '../models/Candidate.js';

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

export const getRecruiterDashboardStats = async (req, res) => {
  try {
    const recruiterJobs = await Job.find({ postedBy: req.user._id })
      .select('_id title company status isActive postedDate')
      .lean();

    const jobIdStrings = recruiterJobs.map((j) => String(j._id));
    const recruiterJobsById = new Map(recruiterJobs.map((j) => [String(j._id), j]));

    const totalJobs = recruiterJobs.length;
    const openJobs = recruiterJobs.filter((j) => j.status === 'Open' && j.isActive !== false).length;

    const baseFilter = { jobId: { $in: jobIdStrings } };
    const since7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalApplicants, applicantsLast7Days, recentApplicants, topJobsAgg] = await Promise.all([
      Candidate.countDocuments(baseFilter),
      Candidate.countDocuments({
        ...baseFilter,
        appliedAt: { $gte: since7Days },
      }),
      Candidate.find(baseFilter)
        .sort({ appliedAt: -1 })
        .limit(5)
        .lean(),
      Candidate.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$jobId', applications: { $sum: 1 } } },
        { $sort: { applications: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const topJobIds = topJobsAgg.map((g) => g._id).filter(Boolean);
    const topJobsDetails = await Job.find({ _id: { $in: topJobIds } })
      .select('_id title company')
      .lean();
    const topJobsById = new Map(topJobsDetails.map((j) => [String(j._id), j]));

    const topJobs = topJobsAgg.map((g) => {
      const job = topJobsById.get(String(g._id)) || recruiterJobsById.get(String(g._id));
      return {
        jobId: g._id,
        title: job?.title || 'Unknown',
        company: job?.company || '',
        applications: g.applications,
      };
    });

    const recentApplicantsWithJob = recentApplicants.map((a) => {
      const job = recruiterJobsById.get(String(a.jobId));
      return {
        ...a,
        jobTitle: a.jobTitle || job?.title,
        company: a.company || job?.company,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        openJobs,
        totalApplicants,
        applicantsLast7Days,
        topJobs,
        recentApplicants: recentApplicantsWithJob,
      },
    });
  } catch (error) {
    console.error('Recruiter dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
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

export const getAppliedCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const safeLimit = Math.min(Number(limit) || 20, 200);
    const skip = (Number(page) - 1) * safeLimit;

    const recruiterJobs = await Job.find({ postedBy: req.user._id })
      .select('_id')
      .lean();
    const jobIdStrings = recruiterJobs.map((j) => String(j._id));

    const filter = { jobId: { $in: jobIdStrings } };

    const [candidates, total] = await Promise.all([
      Candidate.find(filter)
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Candidate.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: candidates,
      pagination: {
        page: Number(page),
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit) || 1,
      },
    });
  } catch (error) {
    console.error('Get applied candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applied candidates',
    });
  }
};

export const searchAppliedCandidates = async (req, res) => {
  try {
    const { q, mode = 'auto', page = 1, limit = 20 } = req.query;
    const safeLimit = Math.min(Number(limit) || 20, 200);
    const skip = (Number(page) - 1) * safeLimit;

    const recruiterJobs = await Job.find({ postedBy: req.user._id })
      .select('_id')
      .lean();
    const jobIdStrings = recruiterJobs.map((j) => String(j._id));

    const filter = { jobId: { $in: jobIdStrings } };

    const rawQuery = q ? String(q).trim() : '';
    const escapeRegExp = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (rawQuery) {
      let safeMode = String(mode || 'auto').toLowerCase();
      const fields = ['fullName', 'email', 'phone', 'jobTitle', 'company'];

      let queryText = rawQuery;
      const prefixMatch = queryText.match(/^(email|name|phrase|keyword)\s*:\s*(.+)$/i);
      if (prefixMatch) {
        safeMode = String(prefixMatch[1]).toLowerCase();
        queryText = String(prefixMatch[2] || '').trim();
      }

      if (safeMode === 'auto') {
        if (/^\S+@\S+\.[^\s]+$/.test(queryText)) {
          safeMode = 'email';
        } else {
          const quoteMatch = queryText.match(/^"([\s\S]+)"$/);
          if (quoteMatch) {
            safeMode = 'phrase';
            queryText = String(quoteMatch[1] || '').trim();
          } else {
            safeMode = 'keyword';
          }
        }
      }

      if (safeMode === 'email') {
        const emailRegex = new RegExp(`^${escapeRegExp(queryText)}$`, 'i');
        filter.email = emailRegex;
      } else if (safeMode === 'name') {
        const nameRegex = new RegExp(escapeRegExp(queryText), 'i');
        filter.fullName = nameRegex;
      } else if (safeMode === 'phrase') {
        const phraseRegex = new RegExp(escapeRegExp(queryText), 'i');
        filter.$or = fields.map((f) => ({ [f]: phraseRegex }));
      } else {
        const tokens = queryText.split(/\s+/).filter(Boolean).slice(0, 8);
        if (tokens.length === 1) {
          const tokenRegex = new RegExp(escapeRegExp(tokens[0]), 'i');
          filter.$or = fields.map((f) => ({ [f]: tokenRegex }));
        } else {
          filter.$and = tokens.map((t) => {
            const tokenRegex = new RegExp(escapeRegExp(t), 'i');
            return {
              $or: fields.map((f) => ({ [f]: tokenRegex })),
            };
          });
        }
      }
    }

    const [candidates, total] = await Promise.all([
      Candidate.find(filter)
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Candidate.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: candidates,
      pagination: {
        page: Number(page),
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit) || 1,
      },
    });
  } catch (error) {
    console.error('Search applied candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching applied candidates',
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

// backend/controllers/companyController.js
import Company from '../models/Company.js';
import User from '../models/User.js';

// @desc    Register new company
// @route   POST /api/companies/register
// @access  Private (Recruiters only)
export const registerCompany = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            name,
            email,
            phone,
            website,
            industry,
            size,
            description,
            foundedYear,
            headquarters,
            socialMedia
        } = req.body;

        // Check if user is recruiter
        const user = await User.findById(userId);
        if (!user || user.userType !== 'recruiter') {
            return res.status(403).json({
                success: false,
                message: 'Only recruiters can register companies'
            });
        }

        // Check if company already exists
        const existingCompany = await Company.findOne({ 
            $or: [{ name }, { email }] 
        });
        
        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: 'Company with this name or email already exists'
            });
        }

        // Create company
        const company = await Company.create({
            name,
            email,
            phone,
            website,
            industry,
            size,
            description,
            foundedYear,
            headquarters,
            socialMedia,
            createdBy: userId,
            recruiters: [userId]
        });

        // Update user with company reference
        user.company = company._id;
        user.companyRole = 'owner';
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Company registered successfully',
            data: company.getSummary()
        });

    } catch (error) {
        console.error('Company registration error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during company registration'
        });
    }
};

// @desc    Get company profile
// @route   GET /api/companies/:id
// @access  Public
export const getCompanyProfile = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id)
            .populate('recruiters', 'firstName lastName email profileImage companyRole')
            .populate('createdBy', 'firstName lastName email');

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check if company is active and verified (unless user is admin/recruiter)
        if (!company.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Company is no longer active'
            });
        }

        res.status(200).json({
            success: true,
            data: company
        });

    } catch (error) {
        console.error('Get company profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update company profile
// @route   PUT /api/companies/:id
// @access  Private (Company admin/owner only)
export const updateCompany = async (req, res) => {
    try {
        const userId = req.user.id;
        const companyId = req.params.id;

        // Check if user has permission to update this company
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check if user is a recruiter for this company
        const user = await User.findById(userId);
        if (!user.company || user.company.toString() !== companyId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this company'
            });
        }

        // Only owner/admin can update company details
        if (!['owner', 'admin'].includes(user.companyRole)) {
            return res.status(403).json({
                success: false,
                message: 'Only company owners/admins can update company details'
            });
        }

        // Update company
        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            { 
                ...req.body,
                lastUpdatedBy: userId
            },
            { 
                new: true, 
                runValidators: true 
            }
        );

        res.status(200).json({
            success: true,
            message: 'Company updated successfully',
            data: updatedCompany.getSummary()
        });

    } catch (error) {
        console.error('Update company error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during company update'
        });
    }
};

// @desc    Get all companies (with filters)
// @route   GET /api/companies
// @access  Public
export const getAllCompanies = async (req, res) => {
    try {
        const { 
            industry, 
            location, 
            size, 
            page = 1, 
            limit = 10,
            search 
        } = req.query;

        // Build query
        const query = { isActive: true };
        
        if (industry) {
            query.industry = new RegExp(industry, 'i');
        }
        
        if (location) {
            query['headquarters.city'] = new RegExp(location, 'i');
        }
        
        if (size) {
            query.size = size;
        }
        
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { industry: new RegExp(search, 'i') }
            ];
        }

        // Execute query with pagination
        const companies = await Company.find(query)
            .select('name industry size headquarters logo description stats isVerified')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        // Get total count
        const total = await Company.countDocuments(query);

        res.status(200).json({
            success: true,
            count: companies.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: companies
        });

    } catch (error) {
        console.error('Get all companies error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get companies by recruiter
// @route   GET /api/companies/recruiter/:recruiterId
// @access  Private
export const getCompaniesByRecruiter = async (req, res) => {
    try {
        const companies = await Company.find({ 
            recruiters: req.params.recruiterId,
            isActive: true 
        })
        .select('name industry size headquarters logo stats isVerified');

        res.status(200).json({
            success: true,
            count: companies.length,
            data: companies
        });

    } catch (error) {
        console.error('Get companies by recruiter error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Add recruiter to company
// @route   POST /api/companies/:id/recruiters
// @access  Private (Company admin/owner only)
export const addRecruiter = async (req, res) => {
    try {
        const companyId = req.params.id;
        const { recruiterEmail, role } = req.body;
        const userId = req.user.id;

        // Find company
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check if current user is owner/admin
        const currentUser = await User.findById(userId);
        if (!['owner', 'admin'].includes(currentUser.companyRole)) {
            return res.status(403).json({
                success: false,
                message: 'Only company owners/admins can add recruiters'
            });
        }

        // Find recruiter user
        const recruiter = await User.findOne({ 
            email: recruiterEmail,
            userType: 'recruiter'
        });
        
        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: 'Recruiter not found'
            });
        }

        // Check if recruiter already in company
        if (company.recruiters.includes(recruiter._id)) {
            return res.status(400).json({
                success: false,
                message: 'Recruiter already added to this company'
            });
        }

        // Add recruiter to company
        await company.addRecruiter(recruiter._id);

        // Update recruiter's company reference
        recruiter.company = company._id;
        recruiter.companyRole = role || 'recruiter';
        await recruiter.save();

        res.status(200).json({
            success: true,
            message: 'Recruiter added successfully'
        });

    } catch (error) {
        console.error('Add recruiter error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Upload company logo
// @route   POST /api/companies/:id/logo
// @access  Private (Company admin/owner only)
export const uploadLogo = async (req, res) => {
    try {
        const companyId = req.params.id;
        const userId = req.user.id;

        // Check permissions
        const company = await Company.findById(companyId);
        const user = await User.findById(userId);

        if (!company || !user || user.company.toString() !== companyId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        if (!['owner', 'admin'].includes(user.companyRole)) {
            return res.status(403).json({
                success: false,
                message: 'Only company owners/admins can upload logo'
            });
        }

        // Handle file upload (assuming you have multer middleware)
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }

        // Update company logo
        company.logo = {
            url: req.file.path,
            publicId: req.file.filename
        };

        await company.save();

        res.status(200).json({
            success: true,
            message: 'Logo uploaded successfully',
            data: {
                logo: company.logo.url
            }
        });

    } catch (error) {
        console.error('Upload logo error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logo upload'
        });
    }
};

// @desc    Delete company (soft delete)
// @route   DELETE /api/companies/:id
// @access  Private (Company owner only)
export const deleteCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        const userId = req.user.id;
        const { reason } = req.body;

        // Check if user is company owner
        const company = await Company.findById(companyId);
        const user = await User.findById(userId);

        if (!company || !user) {
            return res.status(404).json({
                success: false,
                message: 'Company or user not found'
            });
        }

        if (user.companyRole !== 'owner' || user.company.toString() !== companyId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only company owner can delete the company'
            });
        }

        // Soft delete
        company.isActive = false;
        company.deactivatedAt = new Date();
        company.deactivatedReason = reason;
        await company.save();

        res.status(200).json({
            success: true,
            message: 'Company deactivated successfully'
        });

    } catch (error) {
        console.error('Delete company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during company deletion'
        });
    }
};
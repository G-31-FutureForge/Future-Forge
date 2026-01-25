// backend/controllers/authController.js
import User from '../models/User.js';
import Company from '../models/Company.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Helper function to send response
const sendTokenResponse = (user, statusCode, res, message) => {
    const token = generateToken(user._id);

    // Prepare user response data
    const userResponse = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        profileImage: user.profileImage,
        phone: user.phone,
        createdAt: user.createdAt,
        profileCompletion: user.profileCompletionPercentage || 0
    };

    // Add user-specific data based on type
    if (user.userType === 'recruiter') {
        userResponse.companyInfo = user.companyInfo;
        userResponse.recruiterProfile = user.recruiterProfile;
    } else if (user.userType === 'student') {
        userResponse.studentProfile = user.studentProfile;
        userResponse.skills = user.skills;
        userResponse.education = user.education;
    }

    // Cookie options
    const options = {
        expires: new Date(
            Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            message: message,
            token,
            user: userResponse
        });
};

// @desc    Register user (student or recruiter)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            password,
            confirmPassword,
            userType = 'student',
            phone,
            companyName, // For recruiters
            agreeTerms
        } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        if (!agreeTerms) {
            return res.status(400).json({
                success: false,
                message: 'Please agree to the Terms of Service'
            });
        }

        // Additional validation for recruiters
        if (userType === 'recruiter' && !companyName) {
            return res.status(400).json({
                success: false,
                message: 'Company name is required for recruiters'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Check company email uniqueness for recruiters
        if (userType === 'recruiter') {
            const existingCompany = await Company.findOne({ email });
            if (existingCompany) {
                return res.status(400).json({
                    success: false,
                    message: 'A company with this email already exists'
                });
            }
        }

        // Create user data object
        const userData = {
            firstName,
            lastName,
            email,
            password,
            userType,
            phone
        };

        let company = null;

        // Handle recruiter registration with company
        if (userType === 'recruiter') {
            // Add company info to user (will be updated after company creation)
            userData.companyInfo = {
                role: 'owner',
                department: req.body.department || 'Recruitment',
                permissions: {
                    canPostJobs: true,
                    canViewApplications: true,
                    canInterviewCandidates: true,
                    canManageTeam: true,
                    canViewAnalytics: true,
                    canManageCompanyProfile: true
                }
            };

            // Add recruiter profile
            userData.recruiterProfile = {
                specialization: req.body.specialization || ['General'],
                yearsOfExperience: req.body.yearsOfExperience || 0,
                hiringExpertise: req.body.hiringExpertise || ['All'],
                about: req.body.about || ''
            };
        } else {
            // Add student profile
            userData.studentProfile = {
                headline: req.body.headline || 'Aspiring Professional',
                summary: req.body.summary || '',
                desiredJobTitles: req.body.desiredJobTitles || [],
                preferredLocations: req.body.preferredLocations || [],
                preferredJobTypes: req.body.preferredJobTypes || ['Full-time'],
                availability: 'Immediately'
            };
        }

        // Create user first
        const user = await User.create(userData);
        console.log('User created:', user._id, user.userType);

        // Handle recruiter registration with company
        if (userType === 'recruiter') {
            console.log('Creating company for user:', user._id, userType);
            // Create company after user creation
            company = await Company.create({
                name: companyName,
                email: email,
                phone: phone,
                industry: req.body.industry || 'Technology',
                size: req.body.companySize || '1-10',
                createdBy: user._id,
                recruiters: [user._id]
            });

            // Update user with company ID
            user.companyInfo.companyId = company._id;
            await user.save();

            // Update company with user as creator
            company.createdBy = user._id;
            await company.save();
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');
        user.verificationToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');
        user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await user.save();

        // In production, you would send an email with verificationToken
        // For now, we'll just log it
        console.log(`Verification token for ${email}: ${verificationToken}`);

        // Send response with token
        sendTokenResponse(user, 201, res, 'User registered successfully. Please verify your email.');

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check if user exists with password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated. Please contact support.'
            });
        }

        // Check if user type matches (if specified in login)
        if (userType && user.userType !== userType) {
            return res.status(401).json({
                success: false,
                message: `This email is registered as a ${user.userType}. Please login as ${user.userType}.`
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        user.loginHistory.push({
            timestamp: new Date(),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        await user.save();

        // Send response with token
        sendTokenResponse(user, 200, res, 'Login successful');

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prepare user response data
        const userResponse = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userType: user.userType,
            profileImage: user.profileImage,
            phone: user.phone,
            createdAt: user.createdAt,
            profileCompletion: user.profileCompletionPercentage || 0
        };

        // Add user-specific data based on type
        if (user.userType === 'recruiter' && user.companyInfo?.companyId) {
            const company = await Company.findById(user.companyInfo.companyId);
            userResponse.company = company ? company.getSummary() : null;
            userResponse.companyInfo = user.companyInfo;
            userResponse.recruiterProfile = user.recruiterProfile;
            userResponse.recruiterStats = user.recruiterStats;
        } else if (user.userType === 'student') {
            userResponse.studentProfile = user.studentProfile;
            userResponse.skills = user.skills;
            userResponse.education = user.education;
            userResponse.experience = user.experience;
            userResponse.stats = user.stats;
        }

        res.status(200).json({
            success: true,
            data: userResponse
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/update
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData.password;
        delete updateData.email;
        delete updateData.userType;
        delete updateData.isActive;
        delete updateData._id;

        // Handle file uploads if any
        if (req.file) {
            updateData.profileImage = {
                url: req.file.path,
                publicId: req.file.filename
            };
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { 
                new: true,
                runValidators: true 
            }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user.getPublicProfile()
        });

    } catch (error) {
        console.error('Update profile error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during profile update'
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all password fields'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password change'
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal that user doesn't exist
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset link'
            });
        }

        // Generate reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // In production, send email with resetToken
        // For now, we'll just log it
        console.log(`Password reset token for ${email}: ${resetToken}`);
        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

        res.status(200).json({
            success: true,
            message: 'Password reset email sent',
            resetUrl: resetUrl // In production, don't send this in response
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        
        // Clear tokens on error
        if (user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during password reset request'
        });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { resetToken } = req.params;
        const { password, confirmPassword } = req.body;

        // Validation
        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide password and confirm password'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Hash token
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Log the user in automatically
        sendTokenResponse(user, 200, res, 'Password reset successful');

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset'
        });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:verificationToken
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        const { verificationToken } = req.params;

        // Hash token
        const hashedToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        // Update user
        user.emailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email verification'
        });
    }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};
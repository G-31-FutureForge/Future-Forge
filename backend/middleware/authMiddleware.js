// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Role-based authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        // Check user type (student/recruiter)
        if (roles.includes('recruiter') && req.user.userType !== 'recruiter') {
            return res.status(403).json({
                success: false,
                message: 'Access restricted to recruiters only'
            });
        }
        
        if (roles.includes('student') && req.user.userType !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Access restricted to students only'
            });
        }
        
        next();
    };
};

// Company-specific authorization
export const authorizeCompany = (requiredRole = 'owner') => {
    return async (req, res, next) => {
        try {
            const companyId = req.params.id || req.body.companyId;
            
            if (!companyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
            }
            
            // Check if user is associated with the company
            const user = await User.findById(req.user.id);
            
            if (!user.company || user.company.toString() !== companyId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this company'
                });
            }
            
            // Check role-based permissions
            const rolesHierarchy = {
                'viewer': 1,
                'recruiter': 2,
                'hiring_manager': 3,
                'admin': 4,
                'owner': 5
            };
            
            const userRoleLevel = rolesHierarchy[user.companyRole] || 0;
            const requiredRoleLevel = rolesHierarchy[requiredRole] || 0;
            
            if (userRoleLevel < requiredRoleLevel) {
                return res.status(403).json({
                    success: false,
                    message: `Insufficient permissions. Required role: ${requiredRole}`
                });
            }
            
            next();
        } catch (error) {
            console.error('Company authorization error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during authorization'
            });
        }
    };
};
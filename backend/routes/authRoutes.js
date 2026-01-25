// backend/routes/authRoutes.js
import express from 'express';
import {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    logout
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/verify-email/:verificationToken', verifyEmail);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update', protect, upload.single('profileImage'), updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/logout', protect, logout);

export default router;
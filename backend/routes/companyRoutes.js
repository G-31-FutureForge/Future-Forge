// backend/routes/companyRoutes.js
import express from 'express';
const router = express.Router();
import { 
    registerCompany,
    getCompanyProfile,
    updateCompany,
    getAllCompanies,
    getCompaniesByRecruiter,
    addRecruiter,
    uploadLogo,
    deleteCompany
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// Public routes
router.get('/', getAllCompanies);
router.get('/:id', getCompanyProfile);

// Protected routes (require authentication)
router.use(protect);

// Recruiter-specific routes
router.post('/register', authorize('recruiter'), registerCompany);
router.put('/:id', authorize('recruiter'), updateCompany);
router.delete('/:id', authorize('recruiter'), deleteCompany);
router.post('/:id/logo', authorize('recruiter'), upload.single('logo'), uploadLogo);
router.get('/recruiter/:recruiterId', getCompaniesByRecruiter);
router.post('/:id/recruiters', authorize('recruiter'), addRecruiter);

export default router;
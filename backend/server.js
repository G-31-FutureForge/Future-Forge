// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Routes imports
import authRoutes from './routes/authRoutes.js';
import scrapeRoutes from './routes/scrapeRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import jobExplorationRoutes from './routes/jobExplorationRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import careerGuidanceRoutes from './routes/careerGuidanceRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';

// Load .env explicitly from the backend folder to avoid issues when
// the server is started from a different working directory.
// ES6 equivalent of __dirname (needed before loading .env)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from the backend folder to avoid issues when
// the server is started from a different working directory.
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scrape', scrapeRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/job-exploration', jobExplorationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api', apiRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/career-guidance', careerGuidanceRoutes);
app.use('/api/recruiter', recruiterRoutes);
// Public candidate application endpoints:
//  - POST /api/apply
//  - GET /api/candidates
app.use('/api', candidateRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Future-Forge API is running',
    timestamp: new Date().toISOString()
  });
});

// Fallback route for unmatched paths
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'API route not found',
    requestedUrl: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Handle specific errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'uploads')}`);
  console.log(`🌐 API available at: http://localhost:${PORT}/api`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
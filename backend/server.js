import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import scrapeRoutes from './routes/scrapeRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import jobExplorationRoutes from './routes/jobExplorationRoutes.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// Connect MongoDB
connectDB();

import apiRoutes from './routes/apiRoutes.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scrape', scrapeRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/jobs', jobExplorationRoutes);
app.use('/api', apiRoutes);

// Fallback route for unmatched paths
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
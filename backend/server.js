import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import scrapeRoutes from './routes/scrapeRoutes.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // React app's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scrape', scrapeRoutes);

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

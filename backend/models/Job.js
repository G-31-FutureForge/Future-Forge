import mongoose from 'mongoose';
import { COLLECTIONS } from '../config/collections.js';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  skills: [{
    type: String,
    required: true,
  }],
  requirements: {
    type: [String],
    default: [],
  },
  salary: {
    type: String,
    required: false,
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    required: true,
  },
  postedDate: {
    type: Date,
    default: Date.now,
  },
  applicationDeadline: {
    type: Date,
    required: false,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
}, {
  collection: COLLECTIONS.JOBS,
});

export default mongoose.model('Job', jobSchema);
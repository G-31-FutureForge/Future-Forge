/**
 * Script to update all existing jobs to have status: 'Open' and isActive: true
 * This ensures recruiter-posted jobs are visible in the candidate portal
 */

import mongoose from 'mongoose';
import Job from '../models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

const updateJobsStatus = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/future-forge';
    console.log('Using MongoDB URI:', mongoUri.substring(0, 50) + '...');
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Update all jobs that don't have status or isActive set
    const result = await Job.updateMany(
      {
        $or: [
          { status: { $exists: false } },
          { isActive: { $exists: false } }
        ]
      },
      {
        $set: {
          status: 'Open',
          isActive: true
        }
      }
    );

    console.log('✓ Updated jobs:', result.modifiedCount);
    console.log(`  - Matched: ${result.matchedCount}`);
    console.log(`  - Modified: ${result.modifiedCount}`);

    // Also ensure all jobs with postedBy (recruiter jobs) are Open and Active
    const recruiterJobsResult = await Job.updateMany(
      { postedBy: { $exists: true } },
      {
        $set: {
          status: 'Open',
          isActive: true
        }
      }
    );

    console.log('✓ Ensured all recruiter jobs are Open and Active:');
    console.log(`  - Matched: ${recruiterJobsResult.matchedCount}`);
    console.log(`  - Modified: ${recruiterJobsResult.modifiedCount}`);

    // Show a sample of updated jobs
    const sampleJobs = await Job.find({ postedBy: { $exists: true } })
      .limit(3)
      .select('title company status isActive postedBy');

    console.log('\n✓ Sample of recruiter jobs:');
    sampleJobs.forEach((job, index) => {
      console.log(`  ${index + 1}. ${job.title} (${job.company}) - Status: ${job.status}, Active: ${job.isActive}`);
    });

    console.log('\n✓ Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

updateJobsStatus();

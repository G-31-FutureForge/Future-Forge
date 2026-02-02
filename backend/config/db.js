import mongoose from 'mongoose';

/**
 * Connects to MongoDB. Data is stored in separate collections:
 * - users: all user registrations (students & recruiters)
 * - companies: company registrations (created when recruiters sign up)
 * - jobs: job postings
 * See config/collections.js for collection name constants.
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI not set - skipping MongoDB connection (development/testing mode).');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

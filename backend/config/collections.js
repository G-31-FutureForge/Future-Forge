/**
 * MongoDB collection names used by the application.
 * Ensures users and companies are stored in separate collections.
 */

export const COLLECTIONS = {
  /** All user registrations: students and recruiters */
  USERS: 'users',
  /** Company registrations (created when a recruiter signs up) */
  COMPANIES: 'companies',
  /** Job postings */
  JOBS: 'jobs',
};

export default COLLECTIONS;

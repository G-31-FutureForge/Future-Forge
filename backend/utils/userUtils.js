// backend/utils/userUtils.js
import User from '../models/User.js';

export const calculateProfileScore = (user) => {
    let score = 0;
    const weights = {
        basicInfo: 20,
        profileImage: 10,
        headline: 10,
        bio: 10,
        education: 15,
        skills: 15,
        experience: 10,
        resume: 10
    };

    if (user.firstName && user.lastName && user.email) score += weights.basicInfo;
    if (user.profileImage?.url) score += weights.profileImage;
    if (user.headline) score += weights.headline;
    if (user.bio) score += weights.bio;
    if (user.education?.length > 0) score += weights.education;
    if (user.skills?.length > 0) score += weights.skills;
    if (user.experience?.length > 0) score += weights.experience;
    if (user.resume?.fileUrl) score += weights.resume;

    return Math.min(100, score);
};

export const getRecommendedJobsForStudent = async (userId) => {
    const user = await User.findById(userId);
    if (!user || user.userType !== 'student') return [];

    // Extract user skills and preferences
    const userSkills = user.skills.map(skill => skill.name);
    const desiredTitles = user.studentProfile?.desiredJobTitles || [];
    const preferredLocations = user.studentProfile?.preferredLocations || [];

    // Logic to find matching jobs based on skills and preferences
    // This would typically query the Job model
    return [];
};

export const getRecruiterDashboardStats = async (recruiterId) => {
    const recruiter = await User.findById(recruiterId);
    if (!recruiter || recruiter.userType !== 'recruiter') {
        throw new Error('User is not a recruiter');
    }

    return {
        totalJobsPosted: recruiter.recruiterStats.totalJobsPosted,
        activeJobs: recruiter.recruiterStats.activeJobs,
        totalApplications: recruiter.recruiterStats.totalApplicationsReceived,
        candidatesHired: recruiter.recruiterStats.candidatesHired,
        averageTimeToHire: recruiter.recruiterStats.averageTimeToHire,
        candidateSatisfaction: recruiter.recruiterStats.candidateSatisfaction
    };
};

export const updateUserLastLogin = async (userId, ipAddress, userAgent) => {
    await User.findByIdAndUpdate(userId, {
        $set: { lastLogin: new Date() },
        $push: {
            loginHistory: {
                timestamp: new Date(),
                ipAddress: ipAddress,
                userAgent: userAgent
            }
        }
    });
};
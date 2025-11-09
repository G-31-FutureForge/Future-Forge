import React, { useEffect, useState } from 'react';
import JobExploration from './JobExploration';
import './Career.css';

const Career = () => {
    const [user, setUser] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        // Mock Data for jobs
        setJobs([
            { id: 1, title: 'Frontend Developer', company: 'TechNova', status: 'Applied' },
            { id: 2, title: 'AI Engineer', company: 'FutureLabs', status: 'Recommended' },
            { id: 3, title: 'UI/UX Designer', company: 'Designify', status: 'Interview' },
        ]);

        // Fetch recommended courses from all platforms
        const fetchRecommendedCourses = async () => {
            try {
                const { fetchAndNormalizeCourses, COURSE_PROVIDERS } = await import('../../../utils/courseApi');
                // Fetch career development and skill-building courses from all platforms
                const courses = await fetchAndNormalizeCourses('career development skills', COURSE_PROVIDERS.ALL, 3);
                const mappedCourses = courses.map((course, index) => ({
                    id: index + 1,
                    name: course.title || 'Untitled Course',
                    platform: course.platform || 'Unknown',
                    link: course.link || '#'
                }));
                setCourses(mappedCourses);
            } catch (error) {
                console.error('Error fetching courses:', error);
                // Fallback to empty array on error
                setCourses([]);
            }
        };

        fetchRecommendedCourses();
    }, []);

    const getUserFirstName = () => {
        if (!user) return 'User';
        return user.firstName || user.firstname || user.name || user.username || 'User';
    };

    return (
        <div className="career-container">
            <div className="career-header">
                <h1>Career Growth Hub</h1>
                <p>Explore job opportunities and track your applications</p>
            </div>

            <div className="career-content">
                <div className="career-status-section">
                    <h2>Your Job Status</h2>
                    <div className="job-status-list">
                        {jobs.map(job => (
                            <div key={job.id} className={`job-status-card ${job.status.toLowerCase()}`}>
                                <h4>{job.title}</h4>
                                <p>{job.company}</p>
                                <span className="job-status">{job.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="jobs-exploration-section">
                    <h2>Explore New Opportunities</h2>
                    <JobExploration />
                </div>

                <div className="courses-section">
                    <h2>Recommended Learning Paths</h2>
                    <div className="course-list">
                        {courses.map(course => (
                            <div key={course.id} className="course-card">
                                <h4>{course.name}</h4>
                                <p>Platform: {course.platform}</p>
                                <button className="btn-small">Explore</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Career;
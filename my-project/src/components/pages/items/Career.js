import React, { useState } from 'react';
import './Career.css';

const Career = () => {
    const [step, setStep] = useState(1);
    const [educationLevel, setEducationLevel] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [formData, setFormData] = useState({
        interest: '',
        stream: '',
        preferredJobType: '',
        careerGoal: '',
        preferredSkills: '',
        resume: null
    });
    const [loading, setLoading] = useState(false);
    const [careerData, setCareerData] = useState(null);
    const [error, setError] = useState('');

    // Handle education level selection with smooth transition
    const handleEducationLevelSelect = (level) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setEducationLevel(level);
            setStep(2);
            setFormData({
            interest: '',
            stream: '',
            preferredJobType: '',
            careerGoal: '',
            preferredSkills: '',
            resume: null
        });
            setIsTransitioning(false);
        }, 200);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle file upload
    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            resume: e.target.files[0]
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('educationLevel', educationLevel);
            formDataToSend.append('interest', formData.interest);
            
            if (educationLevel === 'After 12th') {
                formDataToSend.append('stream', formData.stream);
                formDataToSend.append('preferredJobType', formData.preferredJobType);
            }
            
            if (educationLevel === 'After 10th') {
                formDataToSend.append('careerGoal', formData.careerGoal);
                formDataToSend.append('preferredSkills', formData.preferredSkills);
            }
            
            if (educationLevel === 'Graduate' && formData.resume) {
                formDataToSend.append('resume', formData.resume);
            }
            
            if (educationLevel === 'Graduate') {
                formDataToSend.append('interest', formData.interest);
                formDataToSend.append('careerGoal', formData.careerGoal);
            }

            const response = await fetch('/api/career-guidance/generate', {
                method: 'POST',
                body: formDataToSend
            });

            const result = await response.json();

            if (result.success) {
                setCareerData(result.data);
                setIsTransitioning(true);
                setTimeout(() => setStep(3), 150);
                setTimeout(() => setIsTransitioning(false), 400);
            } else {
                setError(result.message || 'Failed to generate career guidance');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Reset to start with transition
    const handleReset = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setStep(1);
            setEducationLevel('');
        setFormData({
            interest: '',
            stream: '',
            preferredJobType: '',
            careerGoal: '',
            preferredSkills: '',
            resume: null
        });
        setCareerData(null);
        setError('');
            setIsTransitioning(false);
        }, 200);
    };

    const handleBackToStep1 = () => {
        setIsTransitioning(true);
        setTimeout(() => { setStep(1); setEducationLevel(''); setIsTransitioning(false); }, 200);
    };

    // Render education level selection
    const renderEducationLevelSelection = () => (
        <div className={`education-level-selection career-step-content ${isTransitioning ? 'career-step-enter' : 'career-step-visible'}`}>
            <h2>Select Your Education Level</h2>
            <div className="education-cards">
                <div 
                    className="education-card"
                    onClick={() => handleEducationLevelSelect('After 10th')}
                >
                    <div className="card-icon">🎓</div>
                    <h3>After 10th</h3>
                    <p>Explore career paths after completing 10th grade</p>
                </div>
                <div 
                    className="education-card"
                    onClick={() => handleEducationLevelSelect('After 12th')}
                >
                    <div className="card-icon">📚</div>
                    <h3>After 12th</h3>
                    <p>Find the right degree and career path</p>
                </div>
                <div 
                    className="education-card"
                    onClick={() => handleEducationLevelSelect('Graduate')}
                >
                    <div className="card-icon">👨‍💼</div>
                    <h3>Graduate</h3>
                    <p>Upskill and advance your career</p>
                </div>
            </div>
        </div>
    );

    // Render form based on education level
    const renderForm = () => {
        if (educationLevel === 'After 10th') {
            return (
                <form onSubmit={handleSubmit} className={`career-form career-step-content ${isTransitioning ? 'career-step-enter' : 'career-step-visible'}`}>
                    <h2>Tell Us About Your Interests</h2>
                    <div className="form-group">
                        <label>Area of Interest *</label>
                        <select 
                            name="interest" 
                            value={formData.interest}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select an interest</option>
                            <option value="Science">Science</option>
                            <option value="Commerce">Commerce</option>
                            <option value="Arts">Arts</option>
                            <option value="Technology">Technology</option>
                            <option value="Creative">Creative</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Engineering">Engineering</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Preferred Skills (Optional)</label>
                        <input
                            type="text"
                            name="preferredSkills"
                            value={formData.preferredSkills}
                            onChange={handleInputChange}
                            placeholder="e.g., Programming, Design, Communication"
                        />
                    </div>
                    <div className="form-group">
                        <label>Career Goal (Optional)</label>
                        <textarea
                            name="careerGoal"
                            value={formData.careerGoal}
                            onChange={handleInputChange}
                            placeholder="What do you want to achieve in your career?"
                            rows="3"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={handleBackToStep1} className="btn-secondary">
                            Back
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Career Roadmap'}
                        </button>
                    </div>
                </form>
            );
        } else if (educationLevel === 'After 12th') {
            return (
                <form onSubmit={handleSubmit} className={`career-form career-step-content ${isTransitioning ? 'career-step-enter' : 'career-step-visible'}`}>
                    <h2>Tell Us About Your Stream & Interests</h2>
                    <div className="form-group">
                        <label>Stream *</label>
                        <select 
                            name="stream" 
                            value={formData.stream}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select your stream</option>
                            <option value="Science (PCM)">Science (PCM)</option>
                            <option value="Science (PCB)">Science (PCB)</option>
                            <option value="Commerce">Commerce</option>
                            <option value="Arts">Arts</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Area of Interest *</label>
                        <input
                            type="text"
                            name="interest"
                            value={formData.interest}
                            onChange={handleInputChange}
                            placeholder="e.g., Data Science, Finance, Design"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Preferred Job Type</label>
                        <select 
                            name="preferredJobType" 
                            value={formData.preferredJobType}
                            onChange={handleInputChange}
                        >
                            <option value="">Select job type</option>
                            <option value="Government">Government</option>
                            <option value="Private">Private</option>
                            <option value="Startup">Startup</option>
                            <option value="Freelance">Freelance</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={handleBackToStep1} className="btn-secondary">
                            Back
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Career Roadmap'}
                        </button>
                    </div>
                </form>
            );
        } else if (educationLevel === 'Graduate') {
            return (
                <form onSubmit={handleSubmit} className={`career-form career-step-content ${isTransitioning ? 'career-step-enter' : 'career-step-visible'}`}>
                    <h2>Tell Us About Your Career Goals</h2>
                    <div className="form-group">
                        <label>Resume Upload (PDF/DOCX)</label>
                        <input
                            type="file"
                            name="resume"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="file-input"
                        />
                        {formData.resume && (
                            <p className="file-name">Selected: {formData.resume.name}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Area of Interest *</label>
                        <input
                            type="text"
                            name="interest"
                            value={formData.interest}
                            onChange={handleInputChange}
                            placeholder="e.g., Data Science, Product Management"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Career Goal (Optional)</label>
                        <textarea
                            name="careerGoal"
                            value={formData.careerGoal}
                            onChange={handleInputChange}
                            placeholder="What career transition or growth are you looking for?"
                            rows="3"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={handleBackToStep1} className="btn-secondary">
                            Back
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Career Roadmap'}
                        </button>
                    </div>
                </form>
            );
        }
        return null;
    };

    // Render career roadmap results
    const renderResults = () => {
        if (!careerData) return null;

        return (
            <div className={`career-results career-step-content career-step-visible career-results-animate`}>
                <div className="results-header">
                    <h2>Your Career Roadmap</h2>
                    <button onClick={handleReset} className="btn-secondary">
                        Start Over
                    </button>
                </div>

                {/* Dataset Info Banner */}
                {careerData.datasetMatches && (
                    <div className="dataset-info-banner">
                        <div className="info-item">
                            <span className="info-label">Matching Profiles:</span>
                            <span className="info-value">{careerData.datasetMatches}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Average Salary:</span>
                            <span className="info-value">{careerData.averageSalary}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Growth Potential:</span>
                            <span className="info-value">{careerData.growthPotential}</span>
                        </div>
                        {careerData.topLocations && careerData.topLocations.length > 0 && (
                            <div className="info-item">
                                <span className="info-label">Top Locations:</span>
                                <span className="info-value">{careerData.topLocations.join(', ')}</span>
                            </div>
                        )}
                    </div>
                )}

                {careerData.summary && (
                    <div className="summary-section">
                        <h3>Career Guidance Summary</h3>
                        <p>{careerData.summary}</p>
                    </div>
                )}

                <div className="career-paths">
                    {careerData.careerPaths.map((path, index) => (
                        <div key={index} className="career-path-card">
                            <div className="path-header">
                                <h3>{path.name}</h3>
                                {path.growthPotential && (
                                    <span className={`growth-badge growth-${path.growthPotential.toLowerCase()}`}>
                                        {path.growthPotential}
                                    </span>
                                )}
                            </div>
                            
                            {path.description && <p className="path-description">{path.description}</p>}
                            
                            {/* Career Details Grid */}
                            <div className="career-details-grid">
                                {path.industry && (
                                    <div className="detail-item">
                                        <strong>Industry:</strong>
                                        <p>{path.industry}</p>
                                    </div>
                                )}
                                {path.experienceLevel && (
                                    <div className="detail-item">
                                        <strong>Experience Level:</strong>
                                        <p>{path.experienceLevel}</p>
                                    </div>
                                )}
                                {path.salaryRange && (
                                    <div className="detail-item">
                                        <strong>Salary Range:</strong>
                                        <p>{path.salaryRange}</p>
                                    </div>
                                )}
                                {path.jobType && (
                                    <div className="detail-item">
                                        <strong>Job Type:</strong>
                                        <p>{path.jobType}</p>
                                    </div>
                                )}
                                {path.locations && path.locations.length > 0 && (
                                    <div className="detail-item">
                                        <strong>Locations:</strong>
                                        <p>{path.locations.join(', ')}</p>
                                    </div>
                                )}
                            </div>

                            {/* Required Skills */}
                            {path.skills && path.skills.length > 0 && (
                                <div className="path-section">
                                    <h4>✓ Required Skills</h4>
                                    <div className="skills-list">
                                        {path.skills.map((skill, i) => (
                                            <span key={i} className="skill-tag skill-required">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skill Gaps */}
                            {path.skillGaps && path.skillGaps.length > 0 && (
                                <div className="path-section">
                                    <h4>⚠️ Skill Gaps to Address</h4>
                                    <div className="skills-list">
                                        {path.skillGaps.map((gap, i) => (
                                            <span key={i} className="skill-tag skill-gap">{gap}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommended Courses */}
                            {path.courses && path.courses.length > 0 && (
                                <div className="path-section">
                                    <h4>📚 Recommended Courses</h4>
                                    <div className="courses-list">
                                        {path.courses.map((course, i) => (
                                            <div key={i} className="course-item">
                                                <div className="course-header">
                                                    <strong>{course.name}</strong>
                                                    <span className="course-type">{course.type}</span>
                                                </div>
                                                <div className="course-meta">
                                                    {course.platform && <span className="course-platform">📱 {course.platform}</span>}
                                                    {course.duration && <span className="course-duration">⏱️ {course.duration}</span>}
                                                </div>
                                                {course.description && <p className="course-description">{course.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Target Job Roles */}
                            {path.jobRoles && path.jobRoles.length > 0 && (
                                <div className="path-section">
                                    <h4>🎯 Target Job Roles</h4>
                                    <div className="jobs-list">
                                        {path.jobRoles.map((job, i) => (
                                            <span key={i} className="job-tag">{job}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Career Roadmap Timeline */}
                            {path.roadmap && path.roadmap.length > 0 && (
                                <div className="path-section">
                                    <h4>🚀 Career Roadmap Timeline</h4>
                                    <div className="roadmap-steps">
                                        {path.roadmap.map((step, i) => (
                                            <div key={i} className="roadmap-step">
                                                <div className="step-header">
                                                    <div className="step-number">{step.step || i + 1}</div>
                                                    <div className="step-title-container">
                                                        <h5>{step.title}</h5>
                                                        {step.timeline && <span className="step-timeline">📅 {step.timeline}</span>}
                                                    </div>
                                                </div>
                                                <div className="step-content">
                                                    {step.description && <p className="step-description">{step.description}</p>}
                                                    {step.actions && step.actions.length > 0 && (
                                                        <ul className="step-actions">
                                                            {step.actions.map((action, j) => (
                                                                <li key={j}>✅ {action}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Visual Diagram */}
                {careerData.diagram && careerData.diagram.nodes && (
                    <div className="diagram-section">
                        <h3>Visual Career Roadmap</h3>
                        <div className="career-diagram">
                            {careerData.diagram.nodes.map((node, i) => (
                                <div 
                                    key={i} 
                                    className={`diagram-node node-${node.type}`}
                                    style={{
                                        left: `${node.position.x}px`,
                                        top: `${node.position.y}px`
                                    }}
                                >
                                    <div className="node-label">{node.label}</div>
                                    {node.skills && (
                                        <div className="node-skills">
                                            {node.skills.slice(0, 3).map((skill, j) => (
                                                <span key={j}>{skill}</span>
                                            ))}
                                        </div>
                                    )}
                                    {node.courses && (
                                        <div className="node-courses">
                                            {node.courses.slice(0, 2).map((course, j) => (
                                                <div key={j}>{course.name}</div>
                                            ))}
                                        </div>
                                    )}
                                    {node.jobs && (
                                        <div className="node-jobs">
                                            {node.jobs.map((job, j) => (
                                                <span key={j}>{job}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="career-container">
            <div className="career-header">
                <h1>AI-Based Career Guidance</h1>
                <p>Get personalized career roadmaps powered by AI</p>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Generating your personalized career roadmap...</p>
                </div>
            )}

            <div className="career-content">
                {step === 1 && <div key="step1" className="career-step-wrapper">{renderEducationLevelSelection()}</div>}
                {step === 2 && <div key="step2" className="career-step-wrapper">{renderForm()}</div>}
                {step === 3 && <div key="step3" className="career-step-wrapper">{renderResults()}</div>}
            </div>
        </div>
    );
};

export default Career;

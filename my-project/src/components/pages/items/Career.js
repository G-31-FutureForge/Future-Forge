import React, { useState, useEffect } from 'react';
import './Career.css';

const Career = () => {
    const [step, setStep] = useState(1);
    const [educationLevel, setEducationLevel] = useState('');
    const [stepDirection, setStepDirection] = useState(1); // 1 forward, -1 back
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
        setStepDirection(1);
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
                setStepDirection(1);
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
        setStepDirection(-1);
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
        setStepDirection(-1);
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

                {careerData.summary && (
                    <div className="summary-section">
                        <h3>Summary</h3>
                        <p>{careerData.summary}</p>
                    </div>
                )}

                <div className="career-paths">
                    {careerData.careerPaths.map((path, index) => (
                        <div key={index} className="career-path-card">
                            <h3>{path.name}</h3>
                            {path.description && <p className="path-description">{path.description}</p>}
                            
                            {path.skills && path.skills.length > 0 && (
                                <div className="path-section">
                                    <h4>Required Skills</h4>
                                    <div className="skills-list">
                                        {path.skills.map((skill, i) => (
                                            <span key={i} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {path.skill_gaps && path.skill_gaps.length > 0 && (
                                <div className="path-section">
                                    <h4>Skill Gaps to Address</h4>
                                    <div className="skills-list">
                                        {path.skill_gaps.map((gap, i) => (
                                            <span key={i} className="skill-tag gap">{gap}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {path.courses && path.courses.length > 0 && (
                                <div className="path-section">
                                    <h4>Recommended Courses</h4>
                                    <div className="courses-list">
                                        {path.courses.map((course, i) => (
                                            <div key={i} className="course-item">
                                                <strong>{course.name}</strong>
                                                <span className="course-type">{course.type}</span>
                                                {course.duration && <span className="course-duration">{course.duration}</span>}
                                                {course.description && <p>{course.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {path.job_roles && path.job_roles.length > 0 && (
                                <div className="path-section">
                                    <h4>Target Job Roles</h4>
                                    <div className="jobs-list">
                                        {path.job_roles.map((job, i) => (
                                            <span key={i} className="job-tag">{job}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {path.roadmap && path.roadmap.length > 0 && (
                                <div className="path-section">
                                    <h4>Career Roadmap</h4>
                                    <div className="roadmap-steps">
                                        {path.roadmap.map((step, i) => (
                                            <div key={i} className="roadmap-step">
                                                <div className="step-number">{step.step || i + 1}</div>
                                                <div className="step-content">
                                                    <h5>{step.title}</h5>
                                                    {step.timeline && <span className="step-timeline">{step.timeline}</span>}
                                                    {step.description && <p>{step.description}</p>}
                                                    {step.actions && step.actions.length > 0 && (
                                                        <ul className="step-actions">
                                                            {step.actions.map((action, j) => (
                                                                <li key={j}>{action}</li>
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

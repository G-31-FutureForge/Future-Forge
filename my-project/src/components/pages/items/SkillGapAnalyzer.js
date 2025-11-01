import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SkillGapAnalyzer.css';

const SkillGapAnalyzer = () => {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleResumeUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        if (file.size <= 5 * 1024 * 1024) { // 5MB limit
          setResume(file);
          setError('');
        } else {
          setError('Resume file size should be less than 5MB');
        }
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!resume) {
      setError('Please upload your resume');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please paste the job description');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysisResult(null);

    try {
      // Simulate API call to analyze skills
      const result = await simulateSkillAnalysis(resume, jobDescription);
      setAnalysisResult(result);
      
      // Store result in localStorage for dashboard
      localStorage.setItem('skillAnalysis', JSON.stringify(result));
      
    } catch (err) {
      setError('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const simulateSkillAnalysis = (resumeFile, jd) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock analysis result - Replace with actual AI analysis
        const mockResult = {
          jobFitScore: Math.floor(Math.random() * 30) + 70, // 70-100%
          matchedSkills: [
            'JavaScript', 'React', 'HTML5', 'CSS3', 'Git',
            'Responsive Design', 'Problem Solving'
          ],
          missingSkills: [
            'Node.js', 'TypeScript', 'AWS', 'MongoDB', 'GraphQL',
            'Docker', 'CI/CD'
          ],
          extraSkills: [
            'Python', 'Photoshop', 'UI/UX Design', 'Project Management'
          ],
          recommendedCourses: [
            {
              id: 1,
              title: 'Node.js - The Complete Guide',
              platform: 'Udemy',
              type: 'paid',
              duration: '25 hours',
              rating: 4.7,
              link: 'https://www.udemy.com/course/nodejs-the-complete-guide/'
            },
            {
              id: 2,
              title: 'TypeScript Fundamentals',
              platform: 'FreeCodeCamp',
              type: 'free',
              duration: '15 hours',
              rating: 4.8,
              link: 'https://www.freecodecamp.org/learn/typescript/'
            },
            {
              id: 3,
              title: 'AWS Certified Cloud Practitioner',
              platform: 'Coursera',
              type: 'paid',
              duration: '30 hours',
              rating: 4.6,
              link: 'https://www.coursera.org/learn/aws-cloud-practitioner'
            },
            {
              id: 4,
              title: 'MongoDB University',
              platform: 'MongoDB',
              type: 'free',
              duration: '20 hours',
              rating: 4.5,
              link: 'https://university.mongodb.com/'
            },
            {
              id: 5,
              title: 'Docker & Kubernetes: The Practical Guide',
              platform: 'Udemy',
              type: 'paid',
              duration: '22 hours',
              rating: 4.7,
              link: 'https://www.udemy.com/course/docker-kubernetes-practical-guide/'
            }
          ],
          jobDescription: jd,
          analysisDate: new Date().toISOString()
        };
        resolve(mockResult);
      }, 5000); // 5 second delay to simulate analysis
    });
  };

  const handleViewDashboard = () => {
    navigate('/skill-gap-dashboard');
  };

  return (
    <div className="skill-gap-analyzer">
      <div className="analyzer-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Skill Gap Analyzer</h1>
        <p>Upload your resume and job description to analyze skill gaps</p>
      </div>

      {!analysisResult ? (
        <div className="analyzer-container">
          <div className="upload-section">
            <div className="resume-upload">
              <h3>📄 Upload Your Resume</h3>
              <div className="upload-area">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="file-input"
                />
                <label htmlFor="resume-upload" className="upload-label">
                  {resume ? (
                    <>
                      <span className="file-icon">📄</span>
                      {resume.name}
                    </>
                  ) : (
                    <>
                      <span className="file-icon">📁</span>
                      Choose PDF Resume
                    </>
                  )}
                </label>
              </div>
              <p className="upload-hint">Max file size: 5MB, PDF format only</p>
            </div>

            <div className="job-description">
              <h3>📝 Paste Job Description</h3>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to analyze required skills..."
                rows="8"
                className="jd-textarea"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !resume || !jobDescription.trim()}
          >
            {isAnalyzing ? (
              <>
                <div className="loading-spinner"></div>
                Analyzing your profile...
              </>
            ) : (
              '🔍 Analyze Skills'
            )}
          </button>
        </div>
      ) : (
        <div className="analysis-complete">
          <div className="success-message">
            <h2>✅ Analysis Complete!</h2>
            <p>Your skill gap analysis is ready. View your personalized dashboard.</p>
          </div>
          <button className="view-dashboard-btn" onClick={handleViewDashboard}>
            View Skill Gap Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalyzer;
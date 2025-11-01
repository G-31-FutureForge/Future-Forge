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
      const formData = new FormData();
      formData.append('resume', resume);
      formData.append('jobDescription', jobDescription);

      console.log('Resume File:', resume);
      console.log('Job Description:', jobDescription);
      console.log('Sending analysis request...'); // Debug log
      
      const response = await fetch('/api/skill-analysis', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status); // Debug log
      const responseData = await response.json();
      console.log('Analysis response:', responseData); // Debug log

      if (!response.ok) {
        throw new Error(responseData.error || 'Analysis failed');
      }

      // Verify response data structure
      const requiredFields = ['jobFitScore', 'matchedSkills', 'missingSkills', 'extraSkills', 'recommendedCourses'];
      const missingFields = requiredFields.filter(field => !responseData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Incomplete analysis data. Missing: ${missingFields.join(', ')}`);
      }

      // Add the job description to the result
      responseData.jobDescription = jobDescription;
      
      setAnalysisResult(responseData);
      localStorage.setItem('skillAnalysis', JSON.stringify(responseData));
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
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
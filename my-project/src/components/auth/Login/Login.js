// src/components/auth/Login/Login.js
import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'student' // Default to student
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userType', formData.userType);
        
        // Redirect based on user type
        if (formData.userType === 'recruiter') {
          window.location.href = '/recruiter-dashboard';
        } else {
          // Redirect to existing Dashboard.js
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login to Your Account</h2>
        {error && <div className="error-message">{error}</div>}
        
        {/* User Type Selection */}
        <div className="form-group user-type-group">
          <div className="user-type-options">
            <label className={`user-type-option ${formData.userType === 'student' ? 'active' : ''}`}>
              <input
                type="radio"
                name="userType"
                value="student"
                checked={formData.userType === 'student'}
                onChange={handleChange}
              />
              <div className="option-content">
                <span className="option-icon">👨‍🎓</span>
                <span className="option-text">Student</span>
              </div>
            </label>
            
            <label className={`user-type-option ${formData.userType === 'recruiter' ? 'active' : ''}`}>
              <input
                type="radio"
                name="userType"
                value="recruiter"
                checked={formData.userType === 'recruiter'}
                onChange={handleChange}
              />
              <div className="option-content">
                <span className="option-icon">👔</span>
                <span className="option-text">Recruiter</span>
              </div>
            </label>
          </div>
        </div>
        
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="login-btn" 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <p className="register-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
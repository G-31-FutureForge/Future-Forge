// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Home from './components/pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/pages/items/Dashboard'; // Existing dashboard
import RecruiterDashboard from './components/pages/items/RecruiterDashboard'; // New recruiter dashboard
import Career from './components/pages/items/Career';
import Profile from './components/pages/items/Profile';
import JobExploration from './components/pages/items/JobExploration';
import TermsOfService from './components/pages/items/TermsOfService';
import SkillGapAnalyzer from './components/pages/items/SkillGapAnalyzer';
import SkillGapDashboard from './components/pages/items/SkillGapDashboard';
import ResumeBuilder from './components/pages/items/ResumeBuilder';
import UpskillCourses from './components/pages/items/UpskillCourses';
import './App.css';

// Protected Route Component with User Type Check
const ProtectedRoute = ({ children, allowedUserTypes }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  // Check if route is restricted to specific user types
  if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
    // Redirect to appropriate dashboard
    return <Navigate to={userType === 'recruiter' ? '/recruiter-dashboard' : '/dashboard'} />;
  }
  
  return children;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Inner component to access useLocation hook
  const AppContent = () => {
    const location = useLocation();
    const isRecruiterDashboard = location.pathname === '/recruiter-dashboard';

    return (
      <div className="App">
        <Navbar toggleSidebar={toggleSidebar} theme={theme} toggleTheme={toggleTheme} />
        {!isRecruiterDashboard && (
          <>
            <Sidebar 
              isOpen={sidebarOpen} 
              toggleSidebar={toggleSidebar}
              closeSidebar={closeSidebar}
            />
            {sidebarOpen && (
              <div className="sidebar-overlay" onClick={closeSidebar}></div>
            )}
          </>
        )}
        
        <main className={`main-content ${sidebarOpen && !isRecruiterDashboard ? 'sidebar-open' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Student Dashboard - Existing Dashboard.js */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedUserTypes={['student']}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Recruiter Dashboard - New Component */}
            <Route 
              path="/recruiter-dashboard" 
              element={
                <ProtectedRoute allowedUserTypes={['recruiter']}>
                  <RecruiterDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Common Routes (accessible by both) */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/terms" 
              element={
                <ProtectedRoute>
                  <TermsOfService />
                </ProtectedRoute>
              } 
            />
            
            {/* Student-specific routes */}
            <Route 
              path="/career" 
              element={
                <ProtectedRoute allowedUserTypes={['student']}>
                  <Career />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/jobs-exploration" 
              element={
                <ProtectedRoute allowedUserTypes={['student']}>
                  <JobExploration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/skill-gap-analyzer" 
              element={
                <ProtectedRoute allowedUserTypes={['student']}>
                  <SkillGapAnalyzer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/skill-gap-dashboard" 
              element={
                <ProtectedRoute allowedUserTypes={['student']}>
                  <SkillGapDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume-builder" 
              element={
                <ProtectedRoute allowedUserTypes={['student']}>
                  <ResumeBuilder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upskill-courses" 
              element={
                <ProtectedRoute allowedUserTypes={['student']}>
                  <UpskillCourses />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    );
  };

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
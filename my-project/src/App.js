import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Home from './components/pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/pages/items/Dashboard';
import Career from './components/pages/items/Career';
import Profile from './components/pages/items/Profile';
import JobExploration from './components/pages/items/JobExploration';
import TermsOfService from './components/pages/items/TermsOfService';
import SkillGapAnalyzer from './components/pages/items/SkillGapAnalyzer';
import SkillGapDashboard from './components/pages/items/SkillGapDashboard';
import ResumeBuilder from './components/pages/items/ResumeBuilder';
import UpskillCourses from './components/pages/items/UpskillCourses';
import './App.css';

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

  return (
    <Router>
      <div className="App">
        <Navbar toggleSidebar={toggleSidebar} theme={theme} toggleTheme={toggleTheme} />
        <Sidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
        
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar}></div>
        )}
        
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <Dashboard 
                  sidebarOpen={sidebarOpen}
                  toggleSidebar={toggleSidebar}
                  closeSidebar={closeSidebar}
                />
              } 
            />
            <Route path="/career" element={<Career />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/jobs-exploration" element={<JobExploration />} />
            <Route path="/skill-gap-analyzer" element={<SkillGapAnalyzer />} />
            <Route path="/skill-gap-dashboard" element={<SkillGapDashboard />} />
            <Route path="/upskill-courses" element={<UpskillCourses />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
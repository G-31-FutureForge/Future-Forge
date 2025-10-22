import React, { useState } from 'react';
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
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Router>
      <div className="App">
        <Navbar toggleSidebar={toggleSidebar} />
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
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
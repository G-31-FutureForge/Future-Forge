import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, closeSidebar }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();
  const navigate = useNavigate();

  const handleLinkClick = () => {
    if (closeSidebar) {
      closeSidebar();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (closeSidebar) {
      closeSidebar();
    }
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>Future Forge</h3>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>
            ✕
          </button>
        </div>
        
        <ul className="sidebar-menu">
          {user ? (
            // Show these when user is logged in
            <>
              <li className={location.pathname === '/dashboard' ? 'active' : ''}>
                <Link to="/dashboard" onClick={handleLinkClick}>
                  <span className="sidebar-icon">📊</span>
                  Dashboard
                </Link>
              </li>
              <li className={location.pathname === '/career' ? 'active' : ''}>
                <Link to="/career" onClick={handleLinkClick}>
                  <span className="sidebar-icon">💼</span>
                  Career Paths
                </Link>
              </li>
              <li className={location.pathname === '/jobs-exploration' ? 'active' : ''}>
                <Link to="/jobs-exploration" onClick={handleLinkClick}>
                  <span className="sidebar-icon">🔍</span>
                  Job Exploration
                </Link>
              </li>
              <li className={location.pathname === '/profile' ? 'active' : ''}>
                <Link to="/profile" onClick={handleLinkClick}>
                  <span className="sidebar-icon">👤</span>
                  My Profile
                </Link>
              </li>
              <li className={location.pathname === '/resume-builder' ? 'active' : ''}>
                <Link to="/resume-builder" onClick={handleLinkClick}>
                  <span className="sidebar-icon">📝</span>
                  Resume Builder
                </Link>
              </li>
              <li>
                <a href="#courses" onClick={handleLinkClick}>
                  <span className="sidebar-icon">🎓</span>
                  Learning Courses
                </a>
              </li>
              <li className="sidebar-divider"></li>
              
              <li>
                <button className="sidebar-logout-btn" onClick={handleLogout}>
                  <span className="sidebar-icon">🚪</span>
                  Logout
                </button>
              </li>
            </>
          ) : (
            // Show these when user is not logged in
            <>
              <li className={location.pathname === '/' ? 'active' : ''}>
                <Link to="/" onClick={handleLinkClick}>
                  <span className="sidebar-icon">🏠</span>
                  Home
                </Link>
              </li>
              <li className={location.pathname === '/login' ? 'active' : ''}>
                <Link to="/login" onClick={handleLinkClick}>
                  <span className="sidebar-icon">🔐</span>
                  Login
                </Link>
              </li>
              <li className={location.pathname === '/register' ? 'active' : ''}>
                <Link to="/register" onClick={handleLinkClick}>
                  <span className="sidebar-icon">👤</span>
                  Register
                </Link>
              </li>
              <li className={location.pathname === '/terms' ? 'active' : ''}>
                <Link to="/terms" onClick={handleLinkClick}>
                  <span className="sidebar-icon">📝</span>
                  Terms of Service
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
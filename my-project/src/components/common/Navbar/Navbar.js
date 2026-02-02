import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/jobs-exploration', { 
        state: { searchQuery: searchQuery.trim() } 
      });
      setSearchQuery('');
    }
  };

  const openSearch = () => setShowSearch(true);
  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setUser(null);
    setShowProfileDropdown(false);
    navigate('/');
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Safe function to get user's first name
  const getFirstName = () => {
    if (!user) return 'User';
    return user.firstName || user.firstname || user.name || user.username || 'User';
  };

  // Safe function to get user's last name
  const getLastName = () => {
    if (!user) return '';
    return user.lastName || user.lastname || '';
  };

  const getInitials = () => {
    const firstName = getFirstName();
    const lastName = getLastName();
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Safe function to get user's email
  const getEmail = () => {
    if (!user) return '';
    return user.email || user.mail || '';
  };

  // Safe function to get full name
  const getFullName = () => {
    const firstName = getFirstName();
    const lastName = getLastName();
    
    if (lastName) {
      return `${firstName} ${lastName}`;
    }
    return firstName;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left Section - Menu Button and Brand */}
        <div className="navbar-left">
          {user && (
            <button 
              className="navbar-menu-btn"
              onClick={toggleSidebar}
              title="Open menu"
            >
              ☰
            </button>
          )}
          <Link to={user ? "/dashboard" : "/"} className="navbar-brand">
            Future Forge
          </Link>
        </div>

        {/* Right Section – Search (students only, in place of theme) + Profile / Links */}
        <div className="navbar-right">
          {/* Search button / bar (students only); replaces dark theme toggle */}
          {user && user.userType !== 'recruiter' && (
            <>
              {!showSearch ? (
                <button
                  type="button"
                  className="search-toggle-btn"
                  onClick={openSearch}
                  title="Search jobs"
                  aria-label="Open search"
                >
                  🔍
                </button>
              ) : (
                <div className={`search-container ${showSearch ? 'search-container--open' : ''}`}>
                  <form onSubmit={handleSearch} className="search-form search-form--emerge">
                    <input
                      type="text"
                      placeholder="Search jobs, companies, keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                      autoFocus
                    />
                    <button type="submit" className="search-btn" title="Search">
                      🔍
                    </button>
                    <button
                      type="button"
                      className="search-close-btn"
                      onClick={closeSearch}
                      title="Close search"
                      aria-label="Close search"
                    >
                      ×
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
          {user ? (
            // Show when user is logged in
            <>
              {user.userType !== 'recruiter' && (
                <Link to="/job-finder" className="navbar-link">
                  🔗 Find Jobs
                </Link>
              )}
              <div className="navbar-user">
                <span className="welcome-text">
                  Hi, {getFirstName()}
                </span>
                
                {/* Profile Dropdown */}
                <div className="profile-dropdown-container">
                  <button 
                    className="profile-dropdown-btn"
                    onClick={toggleProfileDropdown}
                  >
                    <div className="nav-profile-avatar">
                      {getInitials()}
                    </div>
                  </button>
                  
                  {showProfileDropdown && (
                    <div className="nav-profile-dropdown">
                      <div className="dropdown-item user-info">
                        <div className="user-details">
                          <strong>{getFullName()}</strong>
                          <span>{getEmail()}</span>
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link 
                        to="/profile"
                        className="dropdown-item"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <span className="dropdown-icon">👤</span>
                        My Profile
                      </Link>
                      <button className="dropdown-item">
                        <span className="dropdown-icon">⚙️</span>
                        Settings
                      </button>
                      <div className="dropdown-divider"></div>
                      <button 
                        className="dropdown-item logout-item"
                        onClick={handleLogout}
                      >
                        <span className="dropdown-icon">🚪</span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Show when user is not logged in
            <>
              <Link to="/" className="navbar-link">Home</Link>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="navbar-link btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
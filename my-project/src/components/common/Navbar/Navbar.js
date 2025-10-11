import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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
      <div className="nav-brand">
        <Link to={user ? "/dashboard" : "/"} className="brand-link">
          Future Forge
        </Link>
      </div>
      <ul className="nav-links">
        {user ? (
          // Show these when user is logged in
          <>
            <li className="profile-dropdown-container">
              <button 
                className="profile-dropdown-btn"
                onClick={toggleProfileDropdown}
              >
                <div className="nav-profile-avatar">
                  {getInitials()}
                </div>
                <span className="nav-user-name">Hi, {getFirstName()}</span>
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
                    to="/dashboard?tab=profile"
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
            </li>
          </>
        ) : (
          // Show these when user is not logged in
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
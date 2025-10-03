import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">Future Forge</div>
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/login">Login</a></li>
        <li><a href="/register">Register</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;

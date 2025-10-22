import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsLoaded(true);
        }, 300);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="home-container">
            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Future Forge</h3>
                    <button onClick={toggleSidebar} className="sidebar-close-btn">
                        ×
                    </button>
                </div>
                
                <div className="sidebar-content">
                    <ul className="sidebar-menu">
                        <li>
                            <Link to="/" onClick={closeSidebar}>
                                <span className="sidebar-icon">🏠</span>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/login" onClick={closeSidebar}>
                                <span className="sidebar-icon">🔐</span>
                                Login
                            </Link>
                        </li>
                        <li>
                            <Link to="/register" onClick={closeSidebar}>
                                <span className="sidebar-icon">📝</span>
                                Register
                            </Link>
                        </li>
                        <li>
                            <Link to="/terms" onClick={closeSidebar}>
                                <span className="sidebar-icon">📄</span>
                                Terms and Services
                            </Link>
                        </li>
                        <li>
                            <a href="#features" onClick={closeSidebar}>
                                <span className="sidebar-icon">⭐</span>
                                Features
                            </a>
                        </li>
                        <li>
                            <a href="#cta" onClick={closeSidebar}>
                                <span className="sidebar-icon">🎯</span>
                                Get Started
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Overlay when sidebar is open */}
            {sidebarOpen && (
                <div 
                    className="sidebar-overlay" 
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Home Header with Menu Button */}
            <header className="home-header">
                <div className="nav-brand">
                    <button 
                        className="sidebar-toggle-btn"
                        onClick={toggleSidebar}
                    >
                        ☰
                    </button>
                    <Link to="/" className="brand-link">
                        Future Forge
                    </Link>
                </div>
                <nav className="home-nav">
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/register" className="nav-link btn btn-primary">Register</Link>
                </nav>
            </header>
            
            <section className="hero-section">
                <div className="hero-content">
                    <div className={`hero-text ${isLoaded ? 'loaded' : ''}`}>
                        <h1 className="hero-title">Future Forge</h1>
                        <p className="hero-subtitle">Crafting Your Future</p>
                        <div className="hero-buttons">
                            <a href="/login" className="btn btn-primary">Get Started</a>
                            <a href="/register" className="btn btn-secondary">Learn More</a>
                        </div>
                    </div>
                    
                    <div className="hero-image">
                        <img 
                            src="/images/backg.jpg" 
                            alt="Future Forge" 
                            className="hero-img"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="container">
                    <h2 className="section-title">What We Offer</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🚀</div>
                            <h3>Career Options</h3>
                            <p>Explore all career paths and find your perfect fit</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💡</div>
                            <h3>Dream Jobs</h3>
                            <p>Discover the job you've always wanted</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">⚡</div>
                            <h3>Fast Tracking</h3>
                            <p>Rapid career development without compromising quality</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="cta" className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Craft Your Future?</h2>
                        <p>Thousands have chosen their path and become successful</p>
                        <a href="/register" className="btn btn-large">Start Your Journey</a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-links">
                            <Link to="/terms">Terms of Service</Link>
                            <Link to="/privacy">Privacy Policy</Link>
                            <a href="#contact">Contact Us</a>
                        </div>
                        <p>&copy; 2024 Future Forge. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;
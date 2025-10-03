import React, { useEffect, useState } from 'react';
import './Home.css';

const Home = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsLoaded(true);
        }, 300);
    }, []);

    return (
        <div className="home-container">  
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
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">What We Offer</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🚀</div>
                            <h3>Career Option</h3>
                            <p>Here you can explore all the career path </p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💡</div>
                            <h3>Job -you need</h3>
                            <p>Search what you want to be</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">⚡</div>
                            <h3>Speed</h3>
                            <p>Rapid development without compromising quality</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Craft every Future?</h2>
                        <p>Thousands of choose there path and become successfull</p>
                        <a href="/register" className="btn btn-large">Start Your Journey</a>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
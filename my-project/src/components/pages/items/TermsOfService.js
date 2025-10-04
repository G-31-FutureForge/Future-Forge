// src/components/pages/items/TermsOfService.js
import React from 'react';
import { Link } from 'react-router-dom';
import './TermsOfService.css';

const TermsOfService = () => {
    return (
        <div className="terms-container">
            <div className="terms-header">
                <Link to="/" className="logo">
                    Future Forge
                </Link>
                <h1>Terms of Service</h1>
                <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="terms-content">
                <div className="terms-section">
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using Future Forge ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                </div>

                <div className="terms-section">
                    <h2>2. Use License</h2>
                    <p>
                        Permission is granted to temporarily use Future Forge for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                    </p>
                </div>

                <div className="terms-section">
                    <h2>3. User Account</h2>
                    <p>
                        When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your account password.
                    </p>
                </div>

                <div className="terms-section">
                    <h2>4. User Responsibilities</h2>
                    <ul>
                        <li>You must be at least 13 years old to use this service</li>
                        <li>You are responsible for maintaining the confidentiality of your account</li>
                        <li>You agree not to use the service for any illegal purpose</li>
                        <li>You will not upload any malicious code or content</li>
                    </ul>
                </div>

                <div className="terms-section">
                    <h2>5. Intellectual Property</h2>
                    <p>
                        The Service and its original content, features, and functionality are and will remain the exclusive property of Future Forge and its licensors.
                    </p>
                </div>

                <div className="terms-section">
                    <h2>6. Termination</h2>
                    <p>
                        We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users.
                    </p>
                </div>

                <div className="terms-section">
                    <h2>7. Limitation of Liability</h2>
                    <p>
                        In no event shall Future Forge, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.
                    </p>
                </div>

                <div className="terms-section">
                    <h2>8. Changes to Terms</h2>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of significant changes.
                    </p>
                </div>

                <div className="terms-section">
                    <h2>9. Contact Information</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at:
                        <br />
                        <strong>Email:</strong> legal@futureforge.com
                        <br />
                        <strong>Address:</strong> 123 Innovation Drive, Tech City, TC 12345
                    </p>
                </div>

                <div className="terms-actions">
                    <Link to="/register" className="btn btn-primary">
                        Back to Registration
                    </Link>
                    <Link to="/" className="btn btn-secondary">
                        Go to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
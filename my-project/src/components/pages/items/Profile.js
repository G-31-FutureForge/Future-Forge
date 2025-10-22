import React, { useEffect, useState } from 'react';
import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    const getUserFirstName = () => {
        if (!user) return 'User';
        return user.firstName || user.firstname || user.name || user.username || 'User';
    };

    const getUserLastName = () => {
        if (!user) return '';
        return user.lastName || user.lastname || '';
    };

    const getUserEmail = () => {
        if (!user) return 'No email provided';
        return user.email || user.mail || 'No email provided';
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Your Profile</h1>
                <p>Manage your account information and preferences</p>
            </div>

            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-info">
                        <div className="info-item">
                            <strong>Name:</strong> 
                            <span>{getUserFirstName()} {getUserLastName()}</span>
                        </div>
                        <div className="info-item">
                            <strong>Email:</strong> 
                            <span>{getUserEmail()}</span>
                        </div>
                        <div className="info-item">
                            <strong>Member Since:</strong> 
                            <span>Today</span>
                        </div>
                        <div className="info-item">
                            <strong>Account Type:</strong> 
                            <span>Standard User</span>
                        </div>
                    </div>
                    <div className="profile-actions">
                        <button className="btn-primary">Edit Profile</button>
                        <button className="btn-secondary">Change Password</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
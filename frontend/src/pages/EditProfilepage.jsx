import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/loginpage.css'; // Reusing login/signup page styles for forms
import logo from './sources/pharmoqrlogo2.png'; // Assuming logo path
import p1 from '../pics/p1.jpg';
import p2 from '../pics/p2.jpg'
import p3 from '../pics/p3.jpg'
import p4 from '../pics/p4.jpg'
import p5 from '../pics/p5.jpg'
import p6 from '../pics/p6.jpg'
import p7 from '../pics/p7.jpg'
import p8 from '../pics/p8.jpg'

function EditProfile() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [profilePicture, setProfilePicture] = useState('default1');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    setError('User not logged in. Redirecting to login...');
                    setTimeout(() => navigate('/login'), 1500);
                    return;
                }

                const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${userId}` }
                });
                setEmail(response.data.user.email);
                setUserType(response.data.user.userType);
                setProfilePicture(response.data.user.profilePicture || 'p1');
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError(err.response?.data?.message || 'Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword && newPassword !== confirmNewPassword) {
            setError('New password and confirm new password do not match.');
            return;
        }

        const userId = localStorage.getItem('userId');
        try {
            const updatePayload = { email, profilePicture }; // Start with email and profilePicture
            if (newPassword) {
                updatePayload.currentPassword = currentPassword;
                updatePayload.newPassword = newPassword;
            }

            const response = await axios.put(`http://localhost:5000/api/users/${userId}`, updatePayload, {
                headers: { 'Authorization': `Bearer ${userId}` }
            });

            setMessage(response.data.message || 'Profile updated successfully!');
            // Clear password fields after successful update
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            // If email was changed, update localStorage
            localStorage.setItem('email', response.data.user.email);

        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Profile update failed.');
        }
    };

    if (loading) {
        return <div className="auth-container"><div className="login-form"><h1>Loading profile...</h1></div></div>;
    }

    if (error) {
        return <div className="auth-container"><div className="login-form"><p style={{ color: 'red' }}>Error: {error}</p></div></div>;
    }

    return (
        <div className="auth-container">
            <img className="logo" src={logo} alt="PharmoQR Logo" />
            <div className="login-form"> {/* Reusing login-form for centering */}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <h2>Edit Your Profile</h2>
                    {message && <p style={{ color: 'green' }}>{message}</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>User Type:</label>
                        <input type="text" value={userType} disabled /> {/* User type cannot be changed here */}
                    </div>

                    <div className="form-group">
                        <label>Profile Picture:</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {[p1, p2, p3, p4, p5, p6, p7, p8].map((pic, index) => (
                                <img
                                    key={index}
                                    src={pic}
                                    alt={`Profile ${index + 1}`}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        border: profilePicture === `p${index + 1}` ? '2px solid blue' : '1px solid #ccc',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setProfilePicture(`p${index + 1}`)}
                                />
                            ))}
                        </div>
                    </div>

                    <h3>Change Password (Optional)</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>Fill these fields only if you want to change your password.</p>
                    <div className="form-group">
                        <label>Current Password:</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>New Password:</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Confirm New Password:</label>
                        <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                    </div>

                    <button type="submit" className="login-btn">Update Profile</button>
                    <button type="button" onClick={() => navigate('/Producer-dashboard')} className="login-btn" style={{ backgroundColor: '#6c757d', marginLeft: '10px' }}>Back to Dashboard</button>
                </form>
            </div>
        </div>
    );
}

export default EditProfile;

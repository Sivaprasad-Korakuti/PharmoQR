import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import '../css/pi.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from './sources/pharmoqrlogo2.png';
import p1 from '../pics/p1.jpg';
import p2 from '../pics/p2.jpg';
import p3 from '../pics/p3.jpg';
import p4 from '../pics/p4.jpg';
import p5 from '../pics/p5.jpg';
import p6 from '../pics/p6.jpg';
import p7 from '../pics/p7.jpg';
import p8 from '../pics/p8.jpg';

const profilePics = {
    p1, p2, p3, p4, p5, p6, p7, p8
};

function ProducerHeaderSidebar({ children }) {
    const [sidebaropen, setsidebaropen] = useState(false);
    const [userName, setUserName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [profilePicture, setProfilePicture] = useState('default1');
    const navigate = useNavigate();

    const togglesidebar = () => {
        setsidebaropen(prev => !prev);
    };

    const handleProfileClick = () => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            navigate('/edit-profile');
        } else {
            alert('User ID not found. Please log in.');
            navigate('/login');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        localStorage.removeItem('email');
        alert('You have been logged out.');
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        alert(`Searching for: ${searchQuery}`);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                navigate('/login');
                return;
            }
            try {
                const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${userId}` }
                });
                const email = response.data.user.email;
                const name = email.split('@')[0];
                setUserName(name);
                setProfilePicture(response.data.user.profilePicture || 'p1');
            } catch (err) {
                console.error('Error fetching profile:', err);
                navigate('/login');
            }
        };
        fetchProfile();
    }, [navigate]);

    return (
        <div>
            {/* Top Header */}
            <div className="producer-header-container">
                <div>
                    <img src={logo} alt="logo" className="pharmo" />
                </div>
                <div className="search-profile-section">
                    <form className="search-container" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-button">
                            <FaSearch />
                        </button>
                    </form>
                </div>
                <div className="profile-section">
                    {userName && <span className="user-email">{userName}</span>}
                    <img
                        src={profilePics[profilePicture] || p1}
                        alt="Profile"
                        className="profile-icon"
                        onClick={handleProfileClick}
                    />
                </div>
            </div>
            {sidebaropen ? <FaTimes className="menu-icon" onClick={togglesidebar} /> : <FaBars className="menu-icon" onClick={togglesidebar} />}
            {/* Main Container */}
            <div className="producer-container">
                {/* Sidebar */}
                <div className={`sidebar ${sidebaropen ? 'open' : ''}`}>
                    <div className="sidebar-btns">
                        <button className="btn"><Link to="/producer-dashboard" className="link">Dashboard</Link></button>
                        <button className="btn"><Link to="/generate-qr" className="link">Generate QR</Link></button>
                        <button className="btn"><Link to="/edit-qr" className="link">Edit QR</Link> </button>
                        <button className="btn"><Link to="/check-qr" className="link" >Check QR</Link></button>
                        <button className="btn"><Link to="/qr-history" className="link">QR History</Link></button>
                        <button className="btn"><Link to="/qr-trails" className="link">Trails</Link></button>
                        <button className="btn"><Link to="/delete-qr" className="link">Delete QR</Link></button>

                        {/* Container for bottom-left links */}
                        <div className="bottom-sidebar-links">
                            <Link to="/contacts" className="sidebar-text-link">Contacts</Link>
                            <Link to="/help" className="sidebar-text-link">Help</Link>
                        </div>

                        {/* Logout button */}
                        <button className="btn logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    {children}
                </div>
            </div>
        </div >
    );
}

export default ProducerHeaderSidebar;
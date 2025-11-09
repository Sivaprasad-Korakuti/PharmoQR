import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProducerHeaderSidebar from './ProducerHeaderSidebar';
import qr1 from '../pages/sources/qr1.png';
import axios from 'axios';


function Producerintf() {
    const [recentQRs, setRecentQRs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            const uname = storedEmail.split('@')[0];
            setUserName(uname);
        } else {
            navigate('/login');
        }

        const fetchRecentQRs = async () => {
            try {
                const userId = localStorage.getItem('userId');
                const userType = localStorage.getItem('userType');

                const userResponse = await axios.get(`http://localhost:5000/api/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${userId}` }
                });
                const email = userResponse.data.user.email;
                const name = email.split('@')[0];
                setUserName(name);

                if (!userId || userType !== 'producer') {
                    setError('You must be logged in as a producer to view recent QR codes.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/recent-qrcodes', {
                    headers: {
                        'Authorization': `Bearer ${userId}`
                    }
                });
                setRecentQRs(response.data);
            } catch (err) {
                console.error('Error fetching recent QR codes:', err);
                setError(err.response?.data?.message || 'Failed to fetch recent QR codes.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecentQRs();
    }, [navigate]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <ProducerHeaderSidebar>
            <div className="recent-qr-list">
                <h2>Recently Generated QR list...</h2>
                <div className="qr-list">
                    {loading ? (
                        <p>Loading recent QR codes...</p>
                    ) : error ? (
                        <p>Error: {error}</p>
                    ) : recentQRs.length === 0 ? (
                        <p>No QR codes generated recently by you.</p>
                    ) : (
                        recentQRs.map((qr) => (
                            <div className="qr-item" key={qr._id}>
                                <img src={qr1} alt="qr-code" />
                                <p><strong>{qr.data.Name}</strong></p>
                                {userName} - {formatDate(qr.createdAt)}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </ProducerHeaderSidebar>
    );
}

export default Producerintf;
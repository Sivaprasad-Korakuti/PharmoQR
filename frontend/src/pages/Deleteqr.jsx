import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProducerHeaderSidebar from './ProducerHeaderSidebar';
import '../css/deleteqr.css'; // Reusing styles from history page for the list
import { FaTrash } from 'react-icons/fa'; // Import trash icon
import img from './sources/img.png';
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

function Delete() {
    const [qrCodes, setQrCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState('');
    const [userName, setUserName] = useState('');
    const [profilePicture, setProfilePicture] = useState('p1');

    const fetchQrHistory = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const userType = localStorage.getItem('userType');

            if (!userId || userType !== 'producer') {
                setError('You must be logged in as a producer to delete QR codes.');
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:5000/api/qr-history', {
                headers: {
                    'Authorization': `Bearer ${userId}`
                }
            });
            setQrCodes(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching QR history for deletion:', err);
            setError(err.response?.data?.message || 'Failed to fetch QR history.');
            setLoading(false);
        }
    };

    useEffect(() => {
        const getUserName = async () => {
            try {
                const userId = localStorage.getItem('userId');
                const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${userId}` }
                });
                const email = response.data.user.email;
                const name = email.split('@')[0];
                setUserName(name);
                setProfilePicture(response.data.user.profilePicture || 'p1');
            }
            catch (err) {
                console.error('failed to get error...');
            }
        };

        getUserName();

        fetchQrHistory();
    }, []); // Fetch on component mount

    const handleDelete = async (qrId, qrName) => {
        if (!window.confirm(`Are you sure you want to delete the QR code for "${qrName}"? This action cannot be undone.`)) {
            return; // User cancelled
        }

        setDeleteMessage(''); // Clear previous messages
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setDeleteMessage('Authentication error. Please log in again.');
                return;
            }

            const response = await axios.delete(`http://localhost:5000/api/qrcodes/${qrId}`, {
                headers: {
                    'Authorization': `Bearer ${userId}`
                }
            });

            setDeleteMessage(response.data.message || 'QR Code deleted successfully!');
            // Update the list by filtering out the deleted QR code
            setQrCodes(prevQRCodes => prevQRCodes.filter(qr => qr._id !== qrId));

        } catch (err) {
            console.error('Error deleting QR code:', err);
            setDeleteMessage(err.response?.data?.message || 'Failed to delete QR code.');
        }
    };

    if (loading) {
        return <ProducerHeaderSidebar><h2>Loading QR Codes...</h2></ProducerHeaderSidebar>;
    }

    if (error) {
        return <ProducerHeaderSidebar><h2>Error: {error}</h2></ProducerHeaderSidebar>;
    }

    return (
        <ProducerHeaderSidebar>
            <div className="history-container">
                <h2><u>Delete QR Code</u></h2>
                {deleteMessage && <p style={{ color: deleteMessage.includes('successfully') ? 'green' : 'red', fontWeight: 'bold' }}>{deleteMessage}</p>}
                {qrCodes.length === 0 ? (
                    <p>No QR codes available for deletion. Generate some first!</p>
                ) : (
                    <div className="qr-codes-list">
                        {qrCodes.map((qr) => (
                            <div className="qr" key={qr._id}>
                                <img src={img} alt="qr"></img>
                                <div>
                                    <h5>Serial No. :&nbsp;{qr.serial}</h5>
                                    <p><strong>Name:</strong> {qr.data?.Name || 'N/A'}</p>
                                    <p><img src={profilePics[profilePicture] || p1} alt="Profile" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }} />{userName}</p>
                                </div>
                                <button className="qr-btn delete-btn" onClick={() => handleDelete(qr._id, qr.data?.Name || 'Unknown')}>
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProducerHeaderSidebar>
    );
}

export default Delete;
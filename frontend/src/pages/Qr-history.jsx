import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProducerHeaderSidebar from './ProducerHeaderSidebar';
import img from './sources/img.png';
import '../css/history.css';
import { FaRegEdit } from "react-icons/fa";
import { Link } from 'react-router-dom';
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

function History() {
    const [qrCodes, setQrCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState('');
    const [profilePicture, setProfilePicture] = useState('p1');

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
        const fetchQrHistory = async () => {
            try {
                const userType = localStorage.getItem('userType');
                const userId = localStorage.getItem('userId');

                if (!userId || userType !== 'producer') {
                    setError('You must be logged in as a producer to view QR history.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/qr-history', {
                    headers: {
                        'Authorization': `Bearer ${userId}`
                    }
                });
                setQrCodes(response.data);
            } catch (err) {
                console.error('Error fetching QR history:', err);
                setError(err.response?.data?.message || 'Failed to fetch QR history.');
            } finally {
                setLoading(false);
            }
        };

        fetchQrHistory();
    }, []);

    if (loading) {
        return <ProducerHeaderSidebar><h2>Loading QR History...</h2></ProducerHeaderSidebar>;
    }

    if (error) {
        return <ProducerHeaderSidebar><h2>Error: {error}</h2></ProducerHeaderSidebar>;
    }

    if (qrCodes.length === 0) {
        return <ProducerHeaderSidebar><h2>No QR Codes Generated Yet.</h2></ProducerHeaderSidebar>;
    }

    return (
        <ProducerHeaderSidebar>
            <div className="history-container">
                <h2><u>Your QR Code History</u></h2>
                <div className="qr-codes-list">
                    {qrCodes.map((qr) => (
                        <div className="qr" key={qr._id}>
                            <img src={img} alt="qr"></img>
                            <div>
                                <h5>Serial No. :&nbsp;{qr.serial}</h5>
                                <p><strong>Name:</strong> {qr.data.Name}</p>
                                <p><img src={profilePics[profilePicture] || p1} alt="Profile" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }} /><span className="nameofthecreator" style={{ border: '2px solid black', padding: '20px;', marginTop: '0px' }}>{userName}</span></p>
                            </div>

                            <Link to={`/edit-qr/${qr._id}`} className="qr-btn">
                                <FaRegEdit />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </ProducerHeaderSidebar >
    );
}

export default History;
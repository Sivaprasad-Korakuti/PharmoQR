import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/history.css'; // Reusing history.css for list styling
import img from './sources/img.png';

function ScanHistory() {
    const [scanHistory, setScanHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchScanHistory = async () => {
            const userId = localStorage.getItem('userId');
            const userType = localStorage.getItem('userType');

            if (!userId || userType !== 'consumer') {
                setError('You must be logged in as a consumer to view your scan history.');
                setLoading(false);

                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/scans/history', {
                    headers: { 'Authorization': `Bearer ${userId}` }
                });
                setScanHistory(response.data);
            } catch (err) {
                console.error('Error fetching scan history:', err);
                setError(err.response?.data?.message || 'Failed to retrieve scan history.');
            } finally {
                setLoading(false);
            }
        };

        fetchScanHistory();
    }, [navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return <div className="history-container"><h2>Loading Scan History...</h2></div>;
    }

    if (error) {
        return <div className="history-container"><h2>Error: {error}</h2></div>;
    }

    return (
        <div className="history-container">
            <h2><u>Your Scan History</u></h2>
            {scanHistory.length === 0 ? (
                <p>No QR codes scanned yet. Start scanning!</p>
            ) : (
                <div className="qr-codes-list">
                    {scanHistory.map((scan) => (
                        <div className="qr" key={scan._id}>
                            <img src={img} alt="scanned-qr"></img>
                            <div>
                                <h5>Serial: {scan.qrCodeId ? scan.qrCodeId.serial : 'N/A'}</h5>
                                <p><strong>Name:</strong> {scan.qrCodeId ? scan.qrCodeId.data.Name : 'Deleted QR'}</p>
                                <p>Scanned At: {formatDate(scan.scannedAt)}</p>
                            </div>

                            {scan.qrCodeId && (
                                <button
                                    className="scan-mode-btn"
                                    onClick={() => navigate(`/view-medicine/${scan.qrCodeId._id}`)}
                                    style={{ marginTop: '10px', fontSize: '0.9rem', padding: '5px 10px' }}
                                >
                                    View Details
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <button className="scan-mode-btn" onClick={() => navigate('/Consumer-dashboard')} style={{ marginTop: '30px' }}>
                Back to Scanner
            </button>
        </div>
    );
}

export default ScanHistory;
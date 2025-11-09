import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/detailspage.css'; // Importing the external CSS file

function Qrcheckerdetails() {
    // Hook to access the state passed from the previous page
    const location = useLocation();
    const navigate = useNavigate();

    // Get the QR data from the location state
    const qrData = location.state?.qrData;

    // Check if data exists
    if (!qrData) {
        return (
            <div className="no-data-container">
                <h2>Qr failed to import data...</h2>
                <button className="back-button" onClick={() => navigate('/')}>Go Back to Scanner</button>
            </div>
        );
    }

    // Check if the data is raw text (not a JSON object)
    if (qrData.raw) {
        return (
            <div className="raw-data-container">
                <h2>QR Code Data</h2>
                <p>This QR code is working perfectly👍</p>
                <pre>{qrData.raw}</pre>
                <button className="back-button" onClick={() => navigate('/')}>Scan Another QR Code</button>
            </div>
        );
    }

    // Assuming the data is a JSON object, display it as a list
    const dataList = Object.entries(qrData);

    return (
        <div className="details-page-container">
            <h1>QR Code Details</h1>
            <p style={{ color: "green" }}><b>Your QR code is working perfectly<span style={{ fontSize: "40px" }} >👍</span></b></p>
            <p>The following information was found in the QR code:</p>

            <ul className="details-list">
                {dataList.map(([key, value]) => (
                    <li key={key} className="details-item">
                        <strong>{key}:</strong> {JSON.stringify(value)}
                    </li>
                ))}
            </ul>

            <button className="back-button" onClick={() => navigate('/')}>Scan Another QR Code</button>
        </div>
    );
}

export default Qrcheckerdetails;
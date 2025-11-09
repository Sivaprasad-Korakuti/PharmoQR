import React from 'react';
import '../css/pi.css'; // Reusing base dashboard styles for background/layout

function Help() {
    return (
        <div className="producer-container"> {/* Reusing producer-container for background */}
            <div className="main-content" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <h2><u>Help & Support</u></h2>
                <p>Welcome to the Help Center.</p>
                <p>Here you can find answers to common questions about using PharmoQR:</p>
                <ul>
                    <li>How to Generate a QR Code?</li>
                    <li>How to Edit a QR Code?</li>
                    <li>How to Delete a QR Code?</li>
                    <li>What is QR Code history?</li>
                    <li>How to use the Consumer Interface?</li>
                </ul>
                <p>If you need further assistance, please visit our <a href="/contacts">Contacts page</a>.</p>
            </div>
        </div>
    );
}

export default Help;
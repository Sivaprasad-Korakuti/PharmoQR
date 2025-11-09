import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsqr from 'jsqr';
import '../css/consumerintf.css';

function Consumerintf() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = async (file) => {
        if (!file) {
            return;
        }

        setLoading(true);
        setError('');

        const reader = new FileReader();
        reader.onload = async (e) => {
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0, image.width, image.height);
                const imageData = context.getImageData(0, 0, image.width, image.height);
                const code = jsqr(imageData.data, imageData.width, imageData.height);

                setLoading(false);

                if (code) {
                    try {
                        const data = JSON.parse(code.data);
                        navigate('/details', { state: { qrData: data } });
                    } catch (jsonError) {
                        navigate('/details', { state: { qrData: { raw: code.data } } });
                    }
                } else {
                    setError('No QR code found in the image.');
                }
            };
            image.src = e.target.result;
        };
        reader.onerror = () => {
            setLoading(false);
            setError('Failed to read file.');
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileChange(files[0]);
        }
    };

    return (
        <div className="consumer-container">
            <h1>QR Code Scanner</h1>
            <p>Upload a QR code image to display its details.</p>

            <div
                className={`drop-area ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <p>Drag & Drop your QR code image here</p>
                <p>— or —</p>
                <label htmlFor="file-upload" className="file-upload-label">
                    Click to Upload
                </label>
                <input
                    id="file-upload"
                    type="file"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
            </div>

            {loading && <p className="status-message">Scanning...</p>}
            {error && <p className="status-message error-message">Error: {error}</p>}
        </div>
    );
}

export default Consumerintf;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProducerHeaderSidebar from './ProducerHeaderSidebar';
import { FaRegEdit } from "react-icons/fa";
import { useParams, useNavigate, Link } from 'react-router-dom'; // Import Link for history list
import QRCode from 'react-qr-code';
import '../css/gqr.css'; // Reusing gqr.css for form and QR display styling
import '../css/history.css'; // Importing history.css for the list view styles
import img from './sources/img.png'; // Placeholder image

function Edit() {
    const { id } = useParams(); // May or may not have an ID
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');

    // State for the single QR edit form/display
    const [formdata, setFormdata] = useState({
        Name: '',
        ManufactureDate: '',
        Uses: '',
        Composition: '',
        PrescriptionRequired: '',
        Originality: '',
        Ownership: '',
        ExpiryDate: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitMessage, setSubmitMessage] = useState('');
    const [showEditForm, setShowEditForm] = useState(true);
    const [updatedQrPayload, setUpdatedQrPayload] = useState(null);

    // NEW STATES for the QR history list
    const [qrCodesList, setQrCodesList] = useState([]); // To store all QRs for list view
    const [displayMode, setDisplayMode] = useState(id ? 'single' : 'list'); // 'single' or 'list'

    // Effect to fetch initial data based on ID or fetch list
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
            }
            catch (err) {
                console.error('failed to get error...');
            }
        };

        getUserName();
        const userId = localStorage.getItem('userId');
        const userType = localStorage.getItem('userType');

        if (!userId || userType !== 'producer') {
            setError('You must be logged in as a producer to access this page.');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            if (id) {
                // Mode: Single QR editing
                setDisplayMode('single');
                try {
                    const response = await axios.get(`http://localhost:5000/api/qrcodes/${id}`, {
                        headers: { 'Authorization': `Bearer ${userId}` }
                    });
                    const qrData = response.data.data;
                    qrData.ManufactureDate = qrData.ManufactureDate ? new Date(qrData.ManufactureDate).toISOString().split('T')[0] : '';
                    qrData.ExpiryDate = qrData.ExpiryDate ? new Date(qrData.ExpiryDate).toISOString().split('T')[0] : '';
                    setFormdata(qrData);
                    setUpdatedQrPayload(response.data); // For initial display of single QR
                    setShowEditForm(true); // Always show form initially when ID is present
                } catch (err) {
                    console.error('Error fetching QR data for editing:', err);
                    setError(err.response?.data?.message || 'Failed to load QR code data.');
                    // If error, maybe go back to list view
                    setDisplayMode('list');
                    fetchQrList(); // Try to fetch list if single failed
                }
            } else {
                // Mode: List of QRs (no ID provided in URL)
                setDisplayMode('list');
                fetchQrList();
            }
            setLoading(false);
        };

        const fetchQrList = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/qr-history', {
                    headers: { 'Authorization': `Bearer ${userId}` }
                });
                setQrCodesList(response.data);
            } catch (err) {
                console.error('Error fetching QR history list:', err);
                setError(err.response?.data?.message || 'Failed to load QR history.');
            }
        };

        fetchData();
    }, [id]); // Re-run effect if ID changes in URL

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormdata((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage('');

        const requiredFields = ['Name', 'ManufactureDate', 'Uses', 'Composition', 'PrescriptionRequired', 'Originality', 'Ownership', 'ExpiryDate'];
        for (const field of requiredFields) {
            if (!formdata[field]) {
                setSubmitMessage(`Please fill the "${field}" field.`);
                return;
            }
        }

        try {
            const userId = localStorage.getItem('userId');
            const response = await axios.put(`http://localhost:5000/api/qrcodes/${id}`, { data: formdata }, {
                headers: { 'Authorization': `Bearer ${userId}` }
            });
            setSubmitMessage(response.data.message || 'QR Code updated successfully!');
            setUpdatedQrPayload(response.data.qrCode);
            setShowEditForm(false); // Switch to display QR mode
        } catch (err) {
            console.error('Error updating QR:', err);
            setSubmitMessage(err.response?.data?.message || 'QR Code update failed.');
        }
    };

    const handleReEdit = () => {
        setSubmitMessage('');
        setShowEditForm(true); // Go back to form view
        // The formdata is already pre-filled from the last fetch/update
    };

    if (loading) {
        return <ProducerHeaderSidebar><h1>Loading content...</h1></ProducerHeaderSidebar>;
    }

    if (error) {
        return <ProducerHeaderSidebar><h1>Error: {error}</h1></ProducerHeaderSidebar>;
    }

    // Main Conditional Render
    return (
        <ProducerHeaderSidebar>
            <div className="generate-qr-whole-container">
                {displayMode === 'list' ? (
                    // Display QR History List
                    <div className="history-container"> {/* Reusing history.css styles */}
                        <h2><u>Select QR Code to Edit</u></h2>
                        {qrCodesList.length === 0 ? (
                            <p>No QR codes available to edit. Generate some first!</p>
                        ) : (
                            <div className="qr-codes-list">
                                {qrCodesList.map((qr) => (
                                    <div className="qr" key={qr._id}>
                                        <img src={img} alt="qr"></img>
                                        <div>
                                            <h5>Serial No. :&nbsp;{qr.serial}</h5>
                                            <p><strong>Name:</strong> {qr.data.Name}</p>
                                            <p>{userName}</p>
                                        </div>
                                        <Link to={`/edit-qr/${qr._id}`} className="qr-btn">
                                            <FaRegEdit />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // Display Single QR Edit Form or Updated QR Display
                    <div className="generateqr-container">
                        {showEditForm ? (
                            // Edit Form View
                            <>
                                <div className="qr-img">
                                    <img src={img} alt="sample-qr-img" className='qr-img' />
                                </div>
                                <div className="info-container">
                                    <form onSubmit={handleSubmit} className="product-details">
                                        <h2>Edit QR Code (Serial: {formdata.serial || updatedQrPayload?.serial || 'N/A'})</h2>
                                        <div className="form-group">
                                            <label>Name:</label>
                                            <input type="text" name="Name" className="qr-input" value={formdata.Name} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Manufacture Date:</label>
                                            <input type="date" name="ManufactureDate" className="qr-input" value={formdata.ManufactureDate} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Uses:</label>
                                            <input type="text" name="Uses" className="qr-input" value={formdata.Uses} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Composition:</label>
                                            <input type="text" name="Composition" className="qr-input" value={formdata.Composition} onChange={handleChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Prescription:</label>
                                            <select name="PrescriptionRequired" className="qr-input" value={formdata.PrescriptionRequired} onChange={handleChange} required>
                                                <option value="" disabled hidden>Prescription Required?</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Originality:</label>
                                            <select name="Originality" className="qr-input" value={formdata.Originality} onChange={handleChange} required>
                                                <option value="" disabled hidden>Original or Not?</option>
                                                <option value="Original">Original</option>
                                                <option value="Fake/Replica">Fake / Not Original</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Ownership:</label>
                                            <select name="Ownership" className="qr-input" value={formdata.Ownership} onChange={handleChange} required>
                                                <option value="" disabled hidden>Self Made or Acquired?</option>
                                                <option value="Self Made">Self Made</option>
                                                <option value="Acquired">Acquired</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Expiry Date:</label>
                                            <input type="date" name="ExpiryDate" className="qr-input" value={formdata.ExpiryDate} onChange={handleChange} required />
                                        </div>
                                        <div className="sub-btn">
                                            <button type="submit" className="generate-btn">Update QR</button>
                                        </div>
                                        {submitMessage && <p className="submit-message" style={{ color: submitMessage.includes('successfully') ? 'green' : 'red' }}>{submitMessage}</p>}
                                    </form>
                                </div>
                            </>
                        ) : (
                            // Updated QR Code Display View
                            <div className="info-container">
                                <div className="qr-result">
                                    <div className="qr-section">
                                        <p><strong>Serial:</strong> {updatedQrPayload?.serial}</p>
                                        {updatedQrPayload?.encoded && <QRCode value={updatedQrPayload.encoded} />}
                                        <div className="qr-info">
                                            <p><strong>Name:</strong> {updatedQrPayload?.data?.Name}</p>
                                            <p><strong>Manufacture Date:</strong> {updatedQrPayload?.data?.ManufactureDate ? new Date(updatedQrPayload.data.ManufactureDate).toLocaleDateString() : 'N/A'}</p>
                                            <p><strong>Uses:</strong> {updatedQrPayload?.data?.Uses}</p>
                                            <p><strong>Composition:</strong> {updatedQrPayload?.data?.Composition}</p>
                                            <p><strong>Prescription:</strong> {updatedQrPayload?.data?.PrescriptionRequired}</p>
                                            <p><strong>Originality:</strong> {updatedQrPayload?.data?.Originality}</p>
                                            <p><strong>Ownership:</strong> {updatedQrPayload?.data?.Ownership}</p>
                                            <p><strong>Expiry Date:</strong> {updatedQrPayload?.data?.ExpiryDate ? new Date(updatedQrPayload.data.ExpiryDate).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="qr-actions">
                                        <div>
                                            <button onClick={handleReEdit}>Re-Edit This QR</button>
                                        </div>
                                        <div>
                                            <button onClick={() => navigate('/qr-history')}>View All History</button> {/* Option to go to full history */}
                                        </div>
                                        <div>
                                            <button onClick={() => window.print()}>Print</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ProducerHeaderSidebar>
    );
}

export default Edit;
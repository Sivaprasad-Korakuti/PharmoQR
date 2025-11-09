import React, { useState } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';
import ProducerHeaderSidebar from './ProducerHeaderSidebar';
import '../css/gqr.css';
import img from './sources/img.png';

function Generateqr() {
    const [formdata, setformdata] = useState({
        Name: '',
        ManufactureDate: '',
        Uses: '',
        Composition: '',
        PrescriptionRequired: '',
        Originality: '',
        Ownership: '',
        ExpiryDate: '',
    });

    const [qrpayload, setqrpayload] = useState(null);
    const [showForm, setShowForm] = useState(true);


    const handleNewQR = () => {
        setformdata({
            Name: '',
            ManufactureDate: '',
            Uses: '',
            Composition: '',
            PrescriptionRequired: '',
            Originality: '',
            Ownership: '',
            ExpiryDate: '',
        });
        setqrpayload(null);
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setformdata((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();

        const requiredFields = ['Name', 'ManufactureDate', 'Uses', 'Composition', 'PrescriptionRequired', 'Originality', 'Ownership', 'ExpiryDate'];
        for (const field of requiredFields) {
            if (!formdata[field]) {
                return alert(`Please fill the "${field}" field.`);
            }
        }

        try {
            // Get userId from localStorage
            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert('You must be logged in to generate QR codes.');
                return;
            }

            const { data } = await axios.post('http://localhost:5000/api/qrcodes', { data: formdata }, {
                headers: {
                    'Authorization': `Bearer ${userId}`
                }
            });

            setqrpayload(data);
            setShowForm(false);
        } catch (err) {
            console.error('❌ Error generating QR:', err);
            alert(err.response?.data?.message || 'QR generation failed');
        }
    };

    return (
        <ProducerHeaderSidebar>
            <div className="generate-qr-whole-container">
                <div className="generateqr-container">
                    <div className="qr-img">
                        <img src={img} alt="sample-qr-img" className='qr-img' />
                    </div>

                    <div className="info-container">
                        {showForm ? (
                            <form onSubmit={handleGenerate} className="product-details">
                                <div className="form-group">
                                    <label>Name:</label>
                                    <input type="text" name="Name" className="qr-input" value={formdata.Name} placeholder="Enter medicine name" onChange={handleChange} required />
                                </div>

                                <div className="form-group">
                                    <label>Manufacture Date:</label>
                                    <input type="date" name="ManufactureDate" className="qr-input" value={formdata.ManufactureDate} onChange={handleChange} required />
                                </div>

                                <div className="form-group">
                                    <label>Uses:</label>
                                    <input type="text" name="Uses" className="qr-input" placeholder="Enter medicine uses" value={formdata.Uses} onChange={handleChange} required />
                                </div>

                                <div className="form-group">
                                    <label>Composition:</label>
                                    <input type="text" name="Composition" className="qr-input" placeholder="Enter medicine composition" value={formdata.Composition} onChange={handleChange} required />
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
                                    <button type="submit" className="generate-btn">Submit</button>
                                </div>
                            </form>

                        ) : (
                            <div className="qr-result">
                                <div className="qr-section">
                                    <p><strong>Serial:</strong> {qrpayload.serial}</p>
                                    <QRCode value={qrpayload.encoded} />

                                    <div className="qr-info">
                                        <p><strong>Name:</strong> {formdata.Name}</p>
                                        <p><strong>Manufacture Date:</strong> {formdata.ManufactureDate}</p>
                                        <p><strong>Uses:</strong> {formdata.Uses}</p>
                                        <p><strong>Composition:</strong> {formdata.Composition}</p>
                                        <p><strong>Prescription:</strong> {formdata.PrescriptionRequired}</p>
                                        <p><strong>Originality:</strong> {formdata.Originality}</p>
                                        <p><strong>Ownership:</strong> {formdata.Ownership}</p>
                                        <p><strong>Expiry Date:</strong> {formdata.ExpiryDate}</p>
                                    </div>

                                </div>
                                <div className="qr-actions">
                                    <div>
                                        <button onClick={handleNewQR}>Create New</button>
                                    </div>
                                    <div><button onClick={() => window.print()}>Print</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProducerHeaderSidebar>
    );
}

export default Generateqr;
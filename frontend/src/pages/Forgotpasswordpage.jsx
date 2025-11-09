import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import logo from './sources/pharmoqrlogo2.png';
import '../css/forgotpassword.css';

function Forgotpassword() {
    const [email, setemail] = useState('');
    const [message, setmessage] = useState('');
    const [error, seterror] = useState('');
    const [isloading, setisloading] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setmessage('');
        seterror('');
        setisloading('');

        try {
            const res = await axios.post('http://localhost:5000/api/forgot-password', { email });
            setmessage(res.data.message) || setemail('');
        } catch (err) {
            console.error('Forgot password request failed:', err);
            setmessage("IF an account with thet email exists,a password reset link has been sent.");
            seterror(err.response?.data?.message || 'An unexpected error occurred.Pleas try agian.');
        } finally {
            setisloading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <img className='logo' src={logo} alt="PharmoQR logo" />
            <div className="forgot-password-form-wrapper">
                <form onSubmit={handleSubmit} className="forgot-password-form">
                    <h2>Forgot Password ?</h2>
                    <p>Enter Your email address and we'll send you a link to reset  your password.</p>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setemail(e.target.value)}
                        required
                        arial-label="Email addrress"
                        className="input-forgot-email"
                        placeholder="Your Email" />

                    <button className="submit-btn" disabled={isloading} type='submit'>{isloading ? 'sending...' : 'Send Reset Link'}</button>

                    {message && <p className='success-message'>{message}</p>}
                    {error && <p className="error-message">{error}</p>}

                    <p className="back-to-login"><Link to='/login'>Back To Login</Link></p>
                </form>
            </div>
        </div>

    );
}

export default Forgotpassword;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import googleIcon from './sources/googleIcon.png';
import facebookIcon from './sources/facebookIcon.png';
import twitterIcon from './sources/twitterIcon.png';
import axios from 'axios';
import '../css/signup.css';
import logo from './sources/pharmoqrlogo2.png';

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        // TODO: Connect to backend register API
        try {
            const res = await axios.post('http://localhost:5000/api/signup', { email, password, userType });
            alert(res.data.message);
            setEmail('');
            setPassword('');
            setUserType('');
            localStorage.setItem('userType', res.data.userType);
            localStorage.setItem('email', res.data.email);
        } catch (err) {
            if (err.response && err.response.data.message) {
                alert(err.response.data.message);
            } else {
                alert("Something went wrong. Try again.");
            }
        }
    };
    const handleSocialLogin = (provider) => {
        //alert(`Registering with...${provider}`);
        window.open(`http://localhost:5000/auth/${provider}`, "_self");
    };
    return (
        <div className="sign-container">
            <img className="logo" src={logo} alt="logo"></img>
            <div className="signup-form">
                <form className="sign-form" onSubmit={handleSignup}>
                    <h2>Create a PharmoQR Account</h2>
                    <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <div className="select-usertype">
                        <select value={userType} onChange={(e) => setUserType(e.target.value)} required >
                            <option value="" disabled hidden >Select user Type</option>
                            <option value="producer"> Producer</option>
                            <option value="consumer">Consumer</option>
                        </select></div>
                    <button type="submit" className="signup-btn">Sign Up</button>
                    <p>or Sign Up with</p>
                    <div className="social-buttons">
                        <button className="g-btn" type="button" onClick={() => handleSocialLogin('google')}>
                            <img src={googleIcon} alt="Google" />
                        </button>
                        <button className="f-btn" type="button" onClick={() => handleSocialLogin('facebook')}>
                            <img src={facebookIcon} alt="Facebook" />
                        </button>
                        <button className="x-btn" type="button" onClick={() => handleSocialLogin('twitter')}>
                            <img src={twitterIcon} alt="Twitter" />
                        </button>
                    </div>
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </form >
            </div>
        </div >
    );
}

export default Signup;

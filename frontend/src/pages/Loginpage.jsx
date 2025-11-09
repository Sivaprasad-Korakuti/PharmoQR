import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/loginpage.css';
import googleIcon from './sources/googleIcon.png';
import facebookIcon from './sources/facebookIcon.png';
import twitterIcon from './sources/twitterIcon.png';
import axios from 'axios';
import logo from './sources/pharmoqrlogo2.png';


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/login', {
                email,
                password
            });
            localStorage.setItem('userType', res.data.userType);
            localStorage.setItem("email", res.data.email);
            localStorage.setItem("userId", res.data.userId);

            if (res.data.userType === 'producer') {
                navigate('/Producer-dashboard');
            } else if (res.data.userType === 'consumer') {
                navigate('/Consumer-dashboard');
            } else {
                alert("Unknown user type.");
            }
        }
        catch (err) {
            if (err.response && err.response.data.message) {
                alert(err.response.data.message);
            } else {
                alert("Login failed. Please try again later.");
            }
        }
    };

    const handleSocialLogin = (provider) => {
        window.open(`http://localhost:5000/auth/${provider}`, "_self");
        //alert(`Logging in with ${provider}`);
    };

    return (
        <div className="auth-login-container">
            <img className="logo" src={logo} alt="logo"></img>
            <div className="login-form">
                <form className="auth-login-form" onSubmit={handleLogin}>
                    <h2>Login to PharmoQR</h2>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <div className="forgot-wrapper">
                        <Link to="/forgot-password" className="forgot-link">Forgot password</Link>
                    </div>
                    <button type="submit" className="login-btn">Login</button>

                    <p>or login with</p>
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

                    <p>Don’t have an account? <Link to="/signup">Sign up here</Link></p>
                </form>
            </div>
        </div>
    );
}

export default Login;
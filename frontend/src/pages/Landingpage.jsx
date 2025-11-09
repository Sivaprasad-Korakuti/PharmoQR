import '../css/landingpage.css';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './sources/pharmoqrlogo2.png';

function Landing() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login');
        }, 8000);
        return () => clearTimeout(timer);
    }
        , [navigate]);
    return (
        <div className="landingpage-container">
            <h2 className="welcome-greet">Welcome To</h2>
            <img className="pharmologo" src={logo} alt="logo"></img>
        </div >
    );
}

export default Landing;
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Loginpage';
import Signup from './pages/Signuppage';
import Landing from './pages/Landingpage';
import Consumerintf from './pages/Consumer-dashboard';
import Producerintf from './pages/Producer-dashboard';
import Generateqr from './pages/Generateqr';
import Edit from './pages/Edit-qr';
import Check from './pages/Check-qr';
import History from './pages/Qr-history';
import Trail from './pages/Qr-trails';
import Delete from './pages/Deleteqr';
import Forgotpassword from './pages/Forgotpasswordpage';
import EditProfile from './pages/EditProfilepage';
import Contact from './pages/Contacts';
import Help from './pages/Helppage';
import ScanHistory from './pages/ScanHistory';
import DetailsPage from './pages/DetailsPage';
import Qrcheckerdetails from './pages/Qrcheckerdetails';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route index element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<Forgotpassword />} />
          <Route path="/Producer-dashboard" element={<Producerintf />} />
          <Route path="/Consumer-dashboard" element={<Consumerintf />} />
          <Route path="/generate-qr" element={<Generateqr />} />
          <Route path="/edit-qr" element={<Edit />} />
          <Route path="/edit-qr/:id" element={<Edit />} />
          <Route path="/check-qr" element={<Check />} />
          <Route path="/qr-history" element={<History />} />
          <Route path="/qr-trails" element={<Trail />} />
          <Route path="/delete-qr" element={<Delete />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/contacts" element={<Contact />} />
          <Route path="/help" element={<Help />} />
          <Route path="/scan-history" element={<ScanHistory />} />
          <Route path="/details" element={<DetailsPage />} />
          <Route path="/Qrchecker" element={<Qrcheckerdetails />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
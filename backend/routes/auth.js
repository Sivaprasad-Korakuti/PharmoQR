const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json({ message: 'Authentication required: No Authorization header provided.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Authentication required: Token format invalid.' });
    }

    try {
        req.user = { id: token, userType: 'producer' }; // Simulating decoded user (userId, userType)
        next();
    } catch (err) {
        console.error('Placeholder Authentication Error:', err);
        return res.status(500).json({ message: 'Server error during authentication process.' });
    }
};

// SIGNUP ROUTE
router.post('/signup', authController.signup);

// LOGIN ROUTE
router.post('/login', authController.login);

// FORGOT PASSWORD ROUTE
router.post('/forgot-password', authController.forgotPassword);

// Get user profile by ID (protected)
router.get('/users/:id', authenticate, authController.getUserProfile);

// Update user profile by ID (protected)
router.put('/users/:id', authenticate, authController.updateUserProfile);

module.exports = router;
const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');

const authenticateConsumer = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json({ message: 'Authentication required.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Authentication required: Token missing.' });
    }

    try {

        req.user = { id: token, userType: localStorage.getItem('userType') || 'consumer' };

        if (req.user.userType !== 'consumer') {
            return res.status(403).json({ message: 'Access denied. Only consumers can access this resource.' });
        }
        next();
    } catch (err) {
        console.error('❌ Consumer Authentication Error:', err);
        return res.status(500).json({ message: 'Server error during consumer authentication.' });
    }
};


router.post('/scans', authenticateConsumer, scanController.logScan);


router.get('/scans/history', authenticateConsumer, scanController.getScanHistory);

module.exports = router;
const express = require('express');
const router = express.Router();
const { createQR, getQRHistory, getRecentQRCodes, getQRById, updateQR, deleteQR, getQRByEncodedData } = require('../controllers/qrController');


const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json({ message: 'Authentication required: No Authorization header provided.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Authentication required: Token format invalid (e.g., missing "Bearer ").' });
    }

    try {
        req.user = {
            id: token,
            userType: 'producer'
        };

        if (req.user.userType !== 'producer') {
            return res.status(403).json({ message: 'Access denied. Only producers can perform this action.' });
        }

        console.log('Placeholder Authentication: User ID', req.user.id, 'User Type', req.user.userType);
        next();

    } catch (err) {
        console.error('Placeholder Authentication Error:', err);
        return res.status(500).json({ message: 'Server error during authentication process.' });
    }
};



router.post('/qrcodes', authenticate, createQR);


router.get('/qr-history', authenticate, getQRHistory);


router.get('/recent-qrcodes', authenticate, getRecentQRCodes);


router.get('/qrcodes/:id', authenticate, getQRById);


router.put('/qrcodes/:id', authenticate, updateQR);


router.delete('/qrcodes/:id', authenticate, deleteQR);

router.get('/qrcodes/scan', getQRByEncodedData);

module.exports = router;
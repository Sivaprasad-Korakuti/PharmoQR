// Path: middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key-that-should-be-in-env';

const authenticateJWT = (userType = ['producer', 'consumer']) => (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('❌ Token verification failed:', err);
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        if (!userType.includes(user.userType)) {
            return res.status(403).json({ message: `Access denied. Only ${userType.join(' or ')} can access this resource.` });
        }

        req.user = user;
        next();
    });
};

module.exports = authenticateJWT;
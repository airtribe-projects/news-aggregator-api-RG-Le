const jwt = require('jsonwebtoken'); 

// Authentication Middleware
function authMiddleware(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.sendStatus(401).json({ error: 'Invalid Request' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.status(403).json({ error: 'Forbidden' });
        }
        req.user = decoded; // Attach user info to request
        console.log('User authenticated:', req.user.username);
        next();
    });
};

module.exports = authMiddleware;

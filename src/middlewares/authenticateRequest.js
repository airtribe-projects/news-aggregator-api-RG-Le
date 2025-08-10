const jwt = require('jsonwebtoken'); 

// Authentication Middleware
function authMiddleware(req, res, next) {
    const completetoken = req.headers['authorization'];
    const token = completetoken && completetoken.split(' ')[1]; // Extract token from Bearer scheme
    if (!token) {
        return res.status(401).json({ error: 'Invalid Request' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.status(403).json({ error: 'Forbidden' });
        }
        req.user = decoded; // Attach user email info to request
        console.log('User authenticated:', req.user.email);
        next();
    });
};

module.exports = authMiddleware;

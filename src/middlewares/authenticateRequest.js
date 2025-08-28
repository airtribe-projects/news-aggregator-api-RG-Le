const jwt = require('jsonwebtoken'); 

// Authentication Middleware
function authMiddleware(req, res, next) {
    try{
        const completetoken = req.headers['authorization'];
        const token = completetoken && completetoken.split(' ')[1]; // Extract token from Bearer scheme
        if (!token) {
            console.log("No token provided in the request headers");
            return res.status(401).json({ error: 'Invalid Request' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('Token verification failed:', err);
                return res.status(401).json({ error: 'Forbidden' });
            }
            req.user = decoded; // Attach user email info to request
            console.log('User authenticated:', req.user.email);
            next();
        });
    } catch (err) {
        console.log("Error occurred while Authenticating the Request:", err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = authMiddleware;

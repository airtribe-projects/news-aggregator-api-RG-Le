const express = require('express');
const router = express.Router();
const { getPreferences, setPreferences } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authenticateRequest');

// Apply authentication middleware to all routes below
router.use(authMiddleware);
// Route to get User Prefereences
router.get('/preferences', getPreferences);
// Route to set User Preferences
router.put('/preferences', setPreferences);

module.exports = router;
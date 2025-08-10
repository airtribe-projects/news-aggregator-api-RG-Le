const userModel = require('../models/userModel');

const getPreferences = (req, res) => {
    const username = req.user.username; // req.user is set by the auth middleware
    try {
        const preferences = userModel.getUserPreferences(username);
        return res.status(preferences.status).json({preferences});
    } catch (error) {
        console.error('Error fetching user preferences:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

const setPreferences = (req, res) => {
    const username = req.user.username; // req.user is set by auth middleware
    const preferences = req.body.preferences;

    if (!preferences) {
        return res.status(400).json({ message: 'Preferences are required' });
    }
    
    // Validate preferences to be an object
    if (typeof preferences !== 'object') {
        return res.status(400).json({message: 'Incorrect Format Recieved for Preferences'});
    }

    const result = userModel.setPreferences(username, preferences);
    return res.status(result.status).json({ message: result.message, preferences: result.preferences || preferences });
}

module.exports = {
    getPreferences, setPreferences
};
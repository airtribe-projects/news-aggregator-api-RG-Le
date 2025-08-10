const userModel = require('../models/userModel');

const getPreferences = (req, res) => {
    const email = req.user.email; // req.user is set by the auth middleware
    try {
        const preferences = userModel.getUserPreferences(email);
        return res.status(preferences.status).json({ message: preferences.message, preferences: preferences.preferences || [] });
    } catch (error) {
        console.error('Error fetching user preferences:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

const setPreferences = (req, res) => {
    const email = req.user.email; // req.user is set by auth middleware
    const preferences = req.body.preferences;

    if (!preferences) {
        return res.status(400).json({ message: 'Preferences are required' });
    }
    
    // Validate preferences to be an Array
    if (Array.isArray(preferences) === false) {
        return res.status(400).json({message: 'Incorrect Format Recieved for Preferences! Please send an Array.'});
    }

    const result = userModel.setPreferences(email, preferences);
    return res.status(result.status).json({ message: result.message, preferences: result.preferences || preferences });
}

module.exports = {
    getPreferences, setPreferences
};
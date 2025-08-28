// const userModel = require('../models/userModelFileSystem');
const User = require("../models/userModel");

const getPreferences = async (req, res) => {
    const email = req.user.email; // req.user is set by the auth middleware and validated at middleware level
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            // Scenario: User Not Found
            return res.status(404).json({ message: 'User not found' });
        } 
        
        return res.status(200).json({
            message: 'User preferences fetched successfully',
            preferences: user.preferences
        });
    } catch (error) {
        console.error('Error fetching user preferences:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const setPreferences = async (req, res) => {
    const email = req.user.email; // req.user is set by auth middleware
    const preferences = req.body.preferences;
    try {
        if (!preferences) {
            return res.status(400).json({ message: 'Preferences are required' });
        }
    
        // Validate preferences to be an Array
        if (Array.isArray(preferences) === false) {
            return res.status(400).json({message: 'Incorrect Format Recieved for Preferences! Please send an Array.'});
        }

        const user = await User.findOneAndUpdate({ email: email }, { preferences: preferences }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: 'User preferences updated successfully',
            preferences: user.preferences
        });
    } catch (error) {
        console.log('Error occurred while setting preferences:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    getPreferences, setPreferences
};
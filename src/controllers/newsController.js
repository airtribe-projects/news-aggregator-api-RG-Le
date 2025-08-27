const User = require("../models/userModel");
const { fetchNewsByPreferences, fetchTopNews } = require("../utils/newsService");

const newsController = async (req, res) => {
    try {
        // Getting the Username
        const email = req.user.email; // set by auth middleware
        console.log('Fetching news for user:', email);

        // Get the user preferences
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userPreferences = user.preferences || [];
        if (!userPreferences || !Array.isArray(userPreferences)) {
            console.log('Invalid preferences structure:', typeof(userPreferences));
            return res.status(404).json({ success: false, message: 'Invalid preferences structure' });
        }
        console.log('User Preferences:', userPreferences);

        const articles = userPreferences.length
            ? await fetchNewsByPreferences(userPreferences)
            : await fetchTopNews();

        if (!articles.length) {
            return res.status(404).json({ success: false, message: 'No articles found' });
        }
        return res.status(200).json({ success: true, news: articles });
    } catch (error) {
        console.log('Error fetching news:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

module.exports = newsController;
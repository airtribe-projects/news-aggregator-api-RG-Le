const User = require("../models/userModel");
const { fetchNewsByPreferences, fetchTopNews } = require("../utils/newsService");

const fetchNews = async (req, res) => {
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

const searchNews = async (req, res) => {
    try {
        const query = req.params.query;
        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query not found!' });
        }

        const articles = await fetchNewsByPreferences([query]);
        if (!articles.length) {
            return res.status(404).json({ success: false, message: 'No articles found for the given query' });
        }
        return res.status(200).json({ success: true, news: articles });
    } catch (err) {
        console.log('Error searching news:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

module.exports = { fetchNews, searchNews };
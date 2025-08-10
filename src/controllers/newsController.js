// const getApiEndpoint = (endpoint, apiKey) => `https://gnews.io/api/v4/${endpoint}?apikey=${apiKey}`;
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const APIKEY = process.env.GNEWS_API_KEY;
const userModel = require('../models/userModel');

// We can map languages, but the test cases do not specify this to be an object..
const fetchNewsByPreferences = async (preferences) => {
    const articlesMap = new Map(); //To avoid duplicates

    try {
        const allRequests = []; // To hold all axios requests
        for (const category of preferences) {
            
            const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(category)}&lang=en&token=${APIKEY}&max=3`;
            console.log(`Fetching news for category: ${category}, language: English from URL: ${url}`);
                
            // Push the axios request to the array
            allRequests.push(
                axios.get(url)
                .catch(error => {
                    console.log(`Error fetching news for category: ${category}, language: English`);
                    return { data: { articles: [] }}
                })
            );
        }

        // Wait for all requests to complete
        console.log(`Total requests made: ${allRequests.length}`);
        const allResponses = await Promise.all(allRequests);
        allResponses.forEach(response => {
           (response.data.articles || []).forEach(article => {
                if (!articlesMap.has(article.url)) {
                    articlesMap.set(article.url, article);
                } 
            });
        });

        // Convert Map to Array
        const articles = Array.from(articlesMap.values());
        console.log(`Fetched ${articles.length} unique articles based on user preferences`);

        // Return the articles
        return articles;
    } catch (error) {
        console.log('Error fetching news:', error);
        throw new Error('Failed to fetch news');
    }
}
   
const fetchTopNews = async () => {
    try {
        const url = `https://gnews.io/api/v4/top-headlines?token=${APIKEY}&max=10`;
        console.log(`Fetching top news from URL: ${url}`);
        
        const response = await axios.get(url);
        if (response.status !== 200) {
            console.log(`Failed to fetch top news, status code: ${response.status}`);
            return [];
        }
        const articles = response.data.articles || [];
        console.log(`Fetched ${articles.length} top news articles`);
        return articles;
    } catch (error) {
        console.log('Error fetching top news:', error);
        throw new Error('Failed to fetch top news');
    }
}

const newsController = (req, res) => {
    // Getting the Username
    const email = req.user.email; // set by auth middleware
    console.log('Fetching news for user:', email);

    // Get the user preferences
    const userPreferences = userModel.getUserPreferences(email);
    console.log('User Preferences:', userPreferences);

    if (
        !userPreferences.preferences ||
        !Array.isArray(userPreferences.preferences)
    ) {
        console.log('Invalid preferences structure:', typeof(userPreferences.preferences));
        throw new Error('Invalid preferences structure');
    }

    // Fetch news based on user preferences
    try {
        if (!userPreferences.preferences.length) {
            // Fetch Top News if no preferences are set
            return fetchTopNews()
                .then(articles => {
                    if (articles.length === 0) {
                        return res.status(404).json({ message: 'No top news articles found' });
                    }
                    return res.status(200).json({ message: "Successfully Fetched News Articles", news: articles });
                })
                .catch(error => {
                    console.error('Error fetching top news:', error);
                    return res.status(500).json({ message: 'Internal Server Error' });
                });
        }

        // Fetch news based on user preferences
        fetchNewsByPreferences(userPreferences.preferences)
            .then(articles => {
                if (articles.length === 0) {
                    return res.status(404).json({ message: 'No news articles found based on user preferences' });
                }
                return res.status(200).json({ message: "Sucessfully Fetched News Articles based on User Preferences", news: articles });
            })
            .catch(error => {
                console.error('Error fetching news:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            });

    } catch (error) {
        console.log('Error fetching news:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = newsController;
const axios = require('axios');
const APIKEY = process.env.GNEWS_API_KEY;
const MAX_PREF_ARTICLES = process.env.MAX_PREF_ARTICLES || 3;
const MAX_TOP_ARTICLES = process.env.MAX_TOP_ARTICLES || 10;
const LANGUAGE = process.env.LANGUAGE || 'en';

const fetchNews = async (url) => {
    try {
        const response = await axios.get(url);
        return response.status === 200 ? response.data.articles : [];
    } catch (error) {
        console.log('Error fetching News from API:', error);
        return [];
    }
}

const fetchNewsByPreferences = async (preferences) => {
    const articlesMap = new Map();

    const requests = preferences.map(category => {
        const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(category)}&lang=${LANGUAGE}&token=${APIKEY}&max=${MAX_PREF_ARTICLES}`;
        return fetchNews(url);
    });

    const results = await Promise.all(requests);
    results.flat().forEach(article => {
        if (!articlesMap.has(article.url)) {
            articlesMap.set(article.url, article);
        }
    });

    return Array.from(articlesMap.values());
}

const fetchTopNews = async () => {
    const url = `https://gnews.io/api/v4/top-headlines?token=${APIKEY}&max=10`;
    return await fetchNews(url);
}

module.exports = { fetchNewsByPreferences, fetchTopNews }; 
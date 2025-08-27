const axios = require('axios');
const APIKEY = process.env.GNEWS_API_KEY;
const MAX_PREF_ARTICLES = process.env.MAX_PREF_ARTICLES || 3;
const MAX_TOP_ARTICLES = process.env.MAX_TOP_ARTICLES || 10;
const LANGUAGE = process.env.LANGUAGE || 'en';

const NEWS_CACHE = new Map(); //Simple in-memory cache
const TOP_NEWS_CACHE_KEY = 'top_news';

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
    try{
        const articlesMap = new Map();
        
        const cachedPreferences = preferences.filter(category => NEWS_CACHE.has(category));
        const unCachedPreferences = preferences.filter(category => !NEWS_CACHE.has(category));
        
        // Checking Cache First
        if (cachedPreferences.length) {
            console.log('Fetching News from Cache for categories:', cachedPreferences);
            const result = preferences.map(category => {
                if (NEWS_CACHE.has(category)) {
                    console.log(`Fetching News for ${category} from Cache`);
                    return NEWS_CACHE.get(category);
                }
            });
        
            if (result.length) {
                result.flat().forEach(article => {
                    if (!articlesMap.has(article.url)) {
                        articlesMap.set(article.url, article);
                    }
                });
            }
        }

        // Fetching Uncached Preferences from API
        const requests = unCachedPreferences.map(category => {
            const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(category)}&lang=${LANGUAGE}&token=${APIKEY}&max=${MAX_PREF_ARTICLES}`;
            return fetchNews(url);
        });

        const results = await Promise.all(requests);
        if (results.length) {
            results.flat().forEach(article => {
                if (!articlesMap.has(article.url)) {
                    articlesMap.set(article.url, article);
                }
            });
            // Cache the results for uncached preferences
            console.log('Caching news for categories:', unCachedPreferences);
            unCachedPreferences.forEach((category, index) => {
                NEWS_CACHE.set(category, results[index]);
            });
        }

        return Array.from(articlesMap.values());
    } catch (error) {
        console.log('Error in fetchNewsByPreferences:', error);
        throw error;
    }
}

const fetchTopNews = async () => {
    try{
        // Direct Return Cached Result
        if (NEWS_CACHE.has(TOP_NEWS_CACHE_KEY)) {
            console.log('Fetching Top News from Cache');
            return NEWS_CACHE.get(TOP_NEWS_CACHE_KEY);
        }

        // Fetch from API and Cache it
        console.log('Fetching Top News from API');
        const url = `https://gnews.io/api/v4/top-headlines?token=${APIKEY}&max=${MAX_TOP_ARTICLES}`;
        const result = await fetchNews(url);
        NEWS_CACHE.set(TOP_NEWS_CACHE_KEY, result);
        return result;
    } catch (error) {
        console.log('Error in fetchTopNews:', error);
        throw error;
    }
}

module.exports = { fetchNewsByPreferences, fetchTopNews }; 
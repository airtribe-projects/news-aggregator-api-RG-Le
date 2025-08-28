const User = require("../models/userModel");
const Article = require("../models/articleModel");
const { fetchNewsByPreferences, fetchTopNews } = require("../utils/newsService");
const { isObjectIdOrHexString } = require("mongoose");

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

const getFavoriteNews = async (req, res) => {
    try {
        const email = req.user.email; // set by auth middleware
        const user = await User.findOne({ email: email }).populate('read.articleId');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }
        
        const favoriteArticles = user.read.filter(
            article => article.articleId !== null && article.isFavorite === true
        ).map(entry => entry.articleId);
        console.log("Fetched Favorite Articles:", favoriteArticles.length);
        if (!favoriteArticles.length) {
            return res.status(404).json({ success: false, message: "No Favortie Articles Found!" });
        }

        return res.status(200).json({ success: true, favoriteArticles: favoriteArticles });
    } catch (error) {
        console.log("Error occured while fetching Favorite news", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const setFavoriteNews = async (req, res) => {
    const article = req.body.article;
    if (!article) {
        return res.status(400).json({ success: false, message: 'Article data is required in the request body' });
    }

    // Validate Article Field!
    const { title, url, lang, source } = article;
    if (!title || !url || !lang || !source || !source.name) {
        console.log("Invalid article data received");
        return res.status(400).json({ success: false, message: 'Missing required article fields' });
    }
    try {
        const email = req.user.email;
        const articleId = req.params.id;
        
        // Validate Article Id
        if (!articleId || isObjectIdOrHexString(articleId) === false) {
            console.log("Invalid article ID received:", articleId);
            return res.status(400).json({ success: false, message: 'Invalid article ID! Should be of type : ObjectId' });
        }

        // Validate User
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        // Find the article in DB
        let existingArticle = await Article.findOne({ url: url });
        if (existingArticle) {
            // If the article exists with the same URL but different ID, use the existing article's ID
            console.log("Found article with same content but different ID. Using existing article ID:", existingArticle._id);
        } else {
            existingArticle = await Article.findOne({ _id: articleId, url: url });
        }
        if (!existingArticle) {
            console.log("Article not found in DB! Adding the Article to DB");
            const newArticle = new Article({
                title,
                description: article.description || "",
                url,
                lang,
                source
            });
            existingArticle = await newArticle.save();
        }

        // Check if already marked as read and favorite
        const readArticle = user.read.find(
            (article) => article.articleId.toString() === existingArticle._id.toString()
        )
        if (readArticle) {
            if (readArticle.isFavorite) {
                console.log("Article is already marked as favorite!");
                return res.status(200).json({ success: true, message: "Article is already marked as favorite!" });
            }
            // Update the isFavorite to true
            console.log("Article is marked as read but not favorite. Updating to favorite!");
            readArticle.isFavorite = true;
            await user.save();
            return res.status(200).json({ success: true, message: "Article marked as favorite successfully!" });
        }

        // Scenario when article is not read
        console.log("Marking article as read and favorite!");
        user.read.push({ articleId: existingArticle._id, isFavorite: true });
        await user.save();
        return res.status(200).json({ success: true, message: "Article marked as favorite successfully!" }); 
    } catch (error) {
        console.log("Error while marking as favorite: ", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const markAsRead = async (req, res) => {
    // Information required in the Body is article
    const article = req.body.article;
    if (!article) {
        return res.status(400).json({ success: false, message: 'Article data is required in the request body' });
    }

    // Validate article fields
    const { title, url, lang, source } = article;
    if (!title || !url || !lang || !source || !source.name) {
        console.log("Invalid article data received");
        return res.status(400).json({ success: false, message: 'Missing required article fields' });
    }

    try {
        const email = req.user.email; // set by auth middleware
        const articleId = req.params.id;
        // Type check for article_id
        if (!articleId || isObjectIdOrHexString(articleId) === false) {
            console.log("Invalid article ID received:", articleId);
            return res.status(400).json({ success: false, message: 'Invalid article ID! Should be of type : ObjectId' });
        }

        // Find the user
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }

        // Check if the article already exists in the database with a same URL and ID
        console.log("Checking for existing article with URL:", url);
        let existingArticle = await Article.findOne({ url: url });
        if (existingArticle) {
            // If the article exists with the same URL but different ID, use the existing article's ID
            console.log("Found article with same content but different ID. Using existing article ID:", existingArticle._id);
        } else {
            existingArticle = await Article.findOne({ _id: articleId, url: url });
        }
        if (!existingArticle) {
            // Create New Article
            console.log("Article not found in DB, creating new article");            
            const newArticle = new Article({
                _id: articleId,
                title,
                description: article.description || '',
                url,
                lang,
                source
            });
            existingArticle = await newArticle.save();
        }

        // Check if the article is already marked as read
        console.log("Checking if article is already marked as read for user:", email);
        const isAlreadyRead = user.read.some(
            (article) => article.articleId.toString() === existingArticle._id.toString()
        );
        if (isAlreadyRead) {
            console.log("Article already marked READ");
            return res.status(200).json({ success: true, message: 'Article already marked as read' });
        }

        // Mark the article as read
        console.log("Marking article as read!");
        user.read.push({ articleId: existingArticle._id });
        await user.save();

        return res.status(200).json({ success: true, message: 'Article marked as read successfully' });   
    } catch (error) {
        console.log('Error Occurred while marking article as read:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const getReadNews = async (req, res) => {
    try {
        const email = req.user.email; // set by auth middleware
        // Find the user
        const user = await User.findOne({ email: email }).populate('read.articleId');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }
        console.log("Fetched read articles");
        
        // Extract the read articles
        const readArticles = user.read.map(entry => entry.articleId).filter(article => article !== null);
        if (!readArticles.length) {
            return res.status(404).json({ success: false, message: 'No read articles found!' });
        }

        return res.status(200).json({ success: true, readArticles: readArticles });
    } catch (error) {
        console.log('Error while fetching the read articles', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

module.exports = { 
    fetchNews, 
    searchNews, 
    getFavoriteNews, 
    setFavoriteNews, 
    markAsRead,
    getReadNews
};
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authenticateRequest');
const { fetchNews, searchNews }  = require('../controllers/newsController');

// Authenticate the request
router.use(authMiddleware);

// Get news for the user
router.get('/', fetchNews);

// searach news by query
router.get('/search/:query', searchNews);

module.exports = router;
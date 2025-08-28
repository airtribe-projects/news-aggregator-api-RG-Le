const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authenticateRequest');
const newsController = require('../controllers/newsController');
// const { fetchNews, searchNews, getFavoriteNews }  = require('../controllers/newsController');

// Authenticate the request
router.use(authMiddleware);

// Get news for the user
router.get('/', newsController.fetchNews);

// searach news by query
router.get('/search/:query', newsController.searchNews);

// read routes
router.get('/read', newsController.getReadNews);
router.post('/:id/read', newsController.markAsRead);

router.get('/favorite', newsController.getFavoriteNews);
router.post('/:id/favorite', newsController.setFavoriteNews);

module.exports = router;
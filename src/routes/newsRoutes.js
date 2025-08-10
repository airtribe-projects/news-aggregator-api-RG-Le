const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authenticateRequest');
const newsController = require('../controllers/newsController');

// Authenticate the request
router.use(authMiddleware);

// Get news for the user
router.get('/news', newsController);

module.exports = router;
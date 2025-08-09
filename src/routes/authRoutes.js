const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route to create User
router.post('/register', authController.registerUser);
// Route to login User
router.post('/login', authController.loginUser);

module.exports = router;
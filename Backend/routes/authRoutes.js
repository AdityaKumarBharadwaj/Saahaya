const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// public routes
router.post('/register', register);
router.post('/login', login);

// protected route
router.get('/me', protect, getMe);

module.exports = router;
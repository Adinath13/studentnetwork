const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, verifyEmail, resendVerificationEmail } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

module.exports = router;

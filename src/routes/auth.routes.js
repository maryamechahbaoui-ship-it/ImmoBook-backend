const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
} = require('../controllers/auth.controller');

// Limite le login à 10 tentatives par 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;
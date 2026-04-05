const express = require('express');
const router  = express.Router();
const {
  register, login, verifyEmail,
  getMe, forgotPassword, resetPassword, updatePassword,
} = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/register',                register);
router.post('/login',                   login);
router.get( '/verify-email/:token',     verifyEmail);
router.post('/forgot-password',         forgotPassword);
router.post('/reset-password/:token',   resetPassword);
router.get( '/me',        verifyToken,  getMe);
router.put( '/update-password', verifyToken, updatePassword);

module.exports = router;
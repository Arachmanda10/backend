const express = require('express');
const router = express.Router();
const authHandler = require('../handlers/authHandler');

router.post('/signup', authHandler.signup);
router.post('/login', authHandler.login);
router.post('/google-login', authHandler.googleLogin);
router.post('/logout', authHandler.logout);

module.exports = router;

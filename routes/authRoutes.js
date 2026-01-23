const express = require('express');
const router = express.Router();
const authController = require('../Controller/authController');

// Forms
router.get('/login', authController.showLogin);
router.get('/register', authController.showRegister);

// POST
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Logout
router.get('/logout', authController.logoutUser);

module.exports = router;

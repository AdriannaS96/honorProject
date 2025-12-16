const express = require('express');
const router = express.Router();

// HOME
router.get('/', (req, res) => {
    res.render('index');   
});

// USER
router.get('/login', (req, res) => {
    res.render('user/login');   
});

router.get('/register', (req, res) => {
    res.render('user/register'); 
});

router.get('/about', (req, res) => {
    res.render('aboutUs'); 
});

module.exports = router;

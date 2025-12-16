const express = require('express');
const router = express.Router();

// HOME
router.get('/', (req, res) => {
    res.render('index');   // ✅ masz index.mustache
});

// USER
router.get('/login', (req, res) => {
    res.render('user/login');   // ✅ PODKATALOG
});

router.get('/register', (req, res) => {
    res.render('user/register'); // ✅ PODKATALOG
});

router.get('/about', (req, res) => {
    res.render('aboutUs'); // ✅ masz aboutUs.mustache
});

module.exports = router;

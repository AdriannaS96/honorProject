const express = require('express');
const router = express.Router();
const listing = require('../Controller/listingsController');

router.get('/', listing.showHome);
router.get('/add', listing.showAddForm);
router.post('/add', listing.addListing);

module.exports = router;

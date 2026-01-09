//Controller/listingController.js
const listingDAO = require('../models/listingModel');

exports.showHome = (req, res) => {
    listingDAO.getAll((err, listings) => {
        if (err) {
            return res.status(500).send('Database error');
        }

        res.render('index', {
            title: 'Home',
            featuredListings: listings
        });
    });
};

exports.showAddForm = (req, res) => {
    res.render('listing/add', { title: 'Add Listing' });
};

exports.addListing = (req, res) => {
    const listing = {
        title: req.body.title,
        location: req.body.location,
        price: req.body.price,
        image: '/images/default.jpg',
        createdAt: new Date()
    };

    listingDAO.create(listing, () => {
        res.redirect('/');
    });
};

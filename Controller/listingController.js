const listingDAO = require('../models/listingModel');
const fs = require("fs");
const path = require("path");

// Home / featured listings
exports.showHome = async (req, res) => {
  try {
    const listings = await listingDAO.getByLandlord("any"); // przykładowo, do homepage możesz dopasować
    res.render('index', {
      title: 'Home',
      featuredListings: listings
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
};

exports.showAddForm = (req, res) => {
  res.render('dashboard/add_listing', { title: 'Add Listing' });
};

// add listing
exports.addListing = async (req, res) => {
  try {
    const { title, location, price, description, status } = req.body;
    const landlord = req.session.user.username;

    const images = req.files
      ? req.files.map(f => ({
          filename: f.filename,
          url: `/uploads/listings/${f.filename}`,
          uploadedAt: new Date()
        }))
      : [];

    await listingDAO.add({ title, location, price, description, status, landlord, images });

    res.redirect('/dashboard/landlord/my_listings');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding listing');
  }
};

// Delete listing
exports.deleteListing = async (req, res) => {
  try {
    const listingId = req.params.id;

    const listing = await listingDAO.getById(listingId);

    if (!listing) return res.redirect("/dashboard/landlord/my_listings");

    if (listing.images && listing.images.length > 0) {
      listing.images.forEach(img => {
        const filePath = path.join(__dirname, "..", "public", img.url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    await listingDAO.remove(listingId);

    res.redirect("/dashboard/landlord/my_listings");

  } catch (err) {
    console.error("❌ Delete listing error:", err);
    res.redirect("/dashboard/landlord/my_listings");
  }
};

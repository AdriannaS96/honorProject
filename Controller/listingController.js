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
exports.showEditForm = async (req, res) => {
  try {
    const listingId = req.params.id;
    const listing = await listingDAO.getById(listingId);

    if (!listing) {
      return res.redirect("/dashboard/landlord/my_listings");
    }

    res.render("dashboard/edit_listing", {
      title: "Edit Listing",
      user: req.session.user,
      listing
    });
  } catch (err) {
    console.error("❌ Show edit form error:", err);
    res.redirect("/dashboard/landlord/my_listings");
  }
};

exports.updateListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    const { title, location, price, description, status } = req.body;

    const listing = await listingDAO.getById(listingId);
    if (!listing) {
      return res.redirect("/dashboard/landlord/my_listings");
    }

    // Obsługa nowych zdjęć
    let images = listing.images || [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => ({
        filename: f.filename,
        url: `/uploads/listings/${f.filename}`,
        uploadedAt: new Date()
      }));
      images = images.concat(newImages);
    }


    await new Promise((resolve, reject) => {
      listingDAO.db.update(
        { _id: listingId },
        { $set: { title, location, price, description, status, images } },
        {},
        (err, numUpdated) => {
          if (err) reject(err);
          else resolve(numUpdated);
        }
      );
    });

    res.redirect("/dashboard/landlord/my_listings");
  } catch (err) {
    console.error("❌ Update listing error:", err);
    res.redirect("/dashboard/landlord/my_listings");
  }
};
exports.showListingDetails = async (req, res) => {
  try {
    const listingId = req.params.id;

    const listing = await listingDAO.getById(listingId);

    if (!listing) {
      return res.status(404).render("404");
    }

    res.render("dashboard/details", {
      title: listing.title,
      listing
    });

  } catch (err) {
    console.error("❌ showListingDetails error:", err);
    res.status(500).send("Server error");
  }
};



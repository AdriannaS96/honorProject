// Controller/listingController.js
const listingDAO = require("../models/listingModel");
const userDAO = require("../models/userModel");
const fs = require("fs");
const path = require("path");

// ================= HOME / FEATURED LISTINGS =================
exports.showHome = async (req, res) => {
  try {
    const listings = await listingDAO.getAll();

    const featuredListings = listings.map(l => ({
      id: l._id || l.id,
      title: l.title,
      location: l.location,
      price: l.price,
      imageUrl:
        l.images && l.images.length > 0
          ? l.images[0].url
          : "/images/default-house.jpg"
    }));

    res.render("index", {
      title: "Home",
      user: req.session.user || null,
      featuredListings
    });
  } catch (err) {
    console.error("❌ showHome error:", err);
    res.status(500).send("Server error");
  }
};

// ================= ADD LISTING =================
exports.showAddForm = (req, res) => {
  res.render("dashboard/add_listing", {
    title: "Add Listing",
    user: req.session.user
  });
};

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

    await listingDAO.add({
      title,
      location,
      price,
      description,
      status,
      landlord,
      images
    });

    res.redirect("/dashboard/landlord/my_listings");
  } catch (err) {
    console.error("❌ addListing error:", err);
    res.status(500).send("Error adding listing");
  }
};

// ================= DELETE LISTING =================
exports.deleteListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    const listing = await listingDAO.getById(listingId);

    if (!listing) {
      return res.redirect("/dashboard/landlord/my_listings");
    }

    if (listing.images && listing.images.length > 0) {
      listing.images.forEach(img => {
        const filePath = path.join(__dirname, "..", "public", img.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await listingDAO.remove(listingId);
    res.redirect("/dashboard/landlord/my_listings");
  } catch (err) {
    console.error("❌ deleteListing error:", err);
    res.redirect("/dashboard/landlord/my_listings");
  }
};

// ================= EDIT LISTING =================
exports.showEditForm = async (req, res) => {
  try {
    const listing = await listingDAO.getById(req.params.id);

    if (!listing) {
      return res.redirect("/dashboard/landlord/my_listings");
    }

    res.render("dashboard/edit_listing", {
      title: "Edit Listing",
      user: req.session.user,
      listing
    });
  } catch (err) {
    console.error("❌ showEditForm error:", err);
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
        err => (err ? reject(err) : resolve())
      );
    });

    res.redirect("/dashboard/landlord/my_listings");
  } catch (err) {
    console.error("❌ updateListing error:", err);
    res.redirect("/dashboard/landlord/my_listings");
  }
};

// ================= LANDLORD LISTING DETAILS =================
exports.showListingDetails = async (req, res) => {
  try {
    const listing = await listingDAO.getById(req.params.id);

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

// ================= PUBLIC LISTING DETAILS =================
exports.showListingDetailsPublic = async (req, res) => {
  try {
    const listing = await listingDAO.getById(req.params.id);

    if (!listing) {
      return res.status(404).render("404");
    }

    // carousel images
    if (listing.images && listing.images.length > 0) {
      listing.images = listing.images.map((img, index) => ({
        url: img.url,
        isFirst: index === 0
      }));
    }

    const isOwner =
      req.session.user &&
      req.session.user.username === listing.landlord;

    let isSaved = false;

    if (req.session.user?.role === "tenant") {
      const savedListings = await new Promise(resolve => {
        userDAO.getSavedListings(
          req.session.user.username,
          (err, list) => resolve(list || [])
        );
      });

      isSaved = savedListings.includes(listing._id);
    }

    res.render("listing_public_details", {
      title: listing.title,
      listing: { ...listing, isOwner, isSaved },
      user: req.session.user || null
    });
  } catch (err) {
    console.error("❌ showListingDetailsPublic error:", err);
    res.status(500).send("Server error");
  }
};

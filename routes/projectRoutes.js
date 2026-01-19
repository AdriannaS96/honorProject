const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const listingController = require("../Controller/listingController");

// MODELS
const upload = require("../auth/upload");
const listingModel = require("../models/listingModel");
const userDAO = require("../models/userModel");
const messagesModel = require("../models/messagesModel");

// MIDDLEWARE
const { isAuthenticated, isLandlord, isTenant } = require("../auth/auth");


/* ================= HOME ================= */
// router.get("/", (req, res) => {
//   res.render("index", {
//     title: "Home",
//     user: req.session.user || null
//   });
// });

router.get("/", listingController.showHome);

// PUBLIC LISTING DETAILS
router.get("/listing/:id", listingController.showListingDetailsPublic);

/* ================= ABOUT ================= */
router.get("/about", (req, res) => {
  res.render("aboutUs", {
    title: "About Us",
    user: req.session.user || null
  });
});

/* ================= REGISTER ================= */
router.get("/register", (req, res) => {
  res.render("user/register", { title: "Register" });
});

router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  userDAO.findByUsername(username, async (err, existingUser) => {
    if (existingUser) {
      return res.render("user/register", {
        title: "Register",
        error: "User already exists"
      });
    }

    await userDAO.create(username, password, role);
    res.redirect("/login");
  });
});

/* ================= LOGIN ================= */
router.get("/login", (req, res) => {
  res.render("user/login", { title: "Login" });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  userDAO.findByUsername(username, async (err, user) => {
    if (!user) {
      return res.render("user/login", { error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("user/login", { error: "Wrong password" });
    }

    req.session.user = {
      username: user.username,
      role: user.role
    };

    if (user.role === "landlord") {
      res.redirect("/dashboard/landlord_dashboard");
    } else {
      res.redirect("/dashboard/tenant_dashboard");
    }
  });
});

/* ================= LOGOUT ================= */
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

/* ================= LANDLORD DASHBOARD ================= */
router.get(
  "/dashboard/landlord_dashboard",
  isAuthenticated,
  isLandlord,
  async (req, res) => {
    try {
      const landlord = req.session.user.username;
      const listings = await listingModel.getByLandlord(landlord) || [];

      const unreadCount = await new Promise((resolve) => {
        messagesModel.countUnread(landlord, (err, count) => {
          if (err) return resolve(0);
          resolve(count);
        });
      });

      res.render("dashboard/landlord_dashboard", {
        title: "Landlord Dashboard",
        user: req.session.user,
        activeListings: listings.filter(l => l.status === "Active").length,
        pendingRequests: listings.filter(l => l.status === "Pending").length,
        messages: unreadCount
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error loading dashboard");
    }
  }
);

/* ================= LANDLORD MY LISTINGS ================= */
router.get(
  "/dashboard/landlord/my_listings",
  isAuthenticated,
  isLandlord,
  async (req, res) => {
    try {
      const listings = await listingModel.getByLandlord(req.session.user.username);

      res.render("dashboard/my_listings", {
        title: "My Listings",
        user: req.session.user,
        listings: listings.map(l => ({
          ...l,
          imagesUrl: l.images && l.images.length > 0
            ? l.images.map(img => img.url)
            : []
        }))
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error loading listings");
    }
  }
);

// EDIT listing form (GET)
router.get(
  "/dashboard/landlord/edit/:id",
  isAuthenticated,
  isLandlord,
  listingController.showEditForm
);
// UPDATE listing (POST)
router.post(
  "/dashboard/landlord/edit/:id",
  isAuthenticated,
  isLandlord,
  upload.array("images", 10), 
  listingController.updateListing
);

// DELETE listing (landlord)
router.get(
  "/dashboard/landlord/delete/:id",
  isAuthenticated,
  isLandlord,
  listingController.deleteListing
);

router.get(
    "/dashboard/landlord/listing/:id",
    listingController.showListingDetails
);


/* ================= LANDLORD ADD LISTING ================= */
router.get(
  "/dashboard/landlord/add_listing",
  isAuthenticated,
  isLandlord,
  (req, res) => {
    res.render("dashboard/add_listing", {
      title: "Add Listing",
      user: req.session.user
    });
  }
);


router.post(
  "/dashboard/landlord/add_listing",
  isAuthenticated,
  isLandlord,
  upload.array("images", 10),
  async (req, res) => {
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

      await listingModel.add({ title, location, price, description, status, landlord, images });

      res.redirect("/dashboard/landlord/my_listings");
    } catch (err) {
      console.error("Error adding listing", err);
      res.status(500).send("Error adding listing");
    }
  }
);
/* ================= LISTINGS ================= */
router.get("/listings", async (req, res) => {
  try {
    const listings = await listingModel.getAll();

    res.render("listings", {
      title: "Listings",
      user: req.session.user || null,
      listings
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading listings");
  }
});
/* ================= LISTING DETAILS ================= */
router.get("/listing/:id", async (req, res) => {
  try {
    const listing = await listingModel.findById(req.params.id);

    if (!listing) {
      return res.status(404).send("Listing not found");
    }

    if (listing.images && listing.images.length > 0) {
      listing.images = listing.images.map((img, index) => ({
        url: img.url,
        isFirst: index === 0
      }));
    }

    res.render("listing_public_details", {
      title: listing.title,
      user: req.session.user || null,
      listing
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading listing details");
  }
});
router.get("/listing/:id", listingController.showListingDetailsPublic);

// POST – save / unsave listing
router.post("/listing/:id/save", (req, res) => {
  if (!req.session.user || req.session.user.role !== "tenant") {
    return res.redirect("/login");
  }

  const listingId = req.params.id;
  const username = req.session.user.username;
  const action = req.body.action;

  if (action === "save") {
    userDAO.saveListing(username, listingId, () => {
      res.redirect(`/listing/${listingId}`);
    });
  } else if (action === "unsave") {
    userDAO.removeSavedListing(username, listingId, () => {
      res.redirect(`/listing/${listingId}`);
    });
  } else {
    res.redirect(`/listing/${listingId}`);
  }
});
/* ================= TENANT DASHBOARD ================= */
router.get(
  "/dashboard/tenant_dashboard",
  isAuthenticated,
  isTenant,
  async (req, res) => {
    try {
      const tenant = req.session.user.username;

      //  saved listings IDs
      const savedListingIds = await new Promise((resolve) => {
        userDAO.getSavedListings(tenant, (err, list) => {
          if (err) return resolve([]);
          resolve(list);
        });
      });

      //listingDAO
      const savedListings = await Promise.all(
        savedListingIds.map(async (id) => {
          const listing = await listingModel.getById(id);
          return listing ? {
            _id: listing._id,
            title: listing.title,
            location: listing.location,
            price: listing.price,
            imageUrl: listing.images && listing.images.length > 0
              ? listing.images[0].url
              : '/images/default-house.jpg'
          } : null;
        })
      );

      const filteredListings = savedListings.filter(l => l !== null);

      const unreadCount = await new Promise((resolve) => {
        messagesModel.countUnread(tenant, (err, count) => {
          if (err) return resolve(0);
          resolve(count);
        });
      });

      res.render("dashboard/tenant_dashboard", {
        title: "Tenant Dashboard",
        user: req.session.user,
        savedListingsCount: filteredListings.length,
        savedListings: filteredListings,
        applicationsSent: 0,
        messages: unreadCount
      });
    } catch (err) {
      console.error("Tenant dashboard error:", err);
      res.status(500).send("Error loading dashboard");
    }
  }
);

/* ================= TENANT APPLICATIONS ================= */
router.get(
  "/dashboard/applications",
  isAuthenticated,
  isTenant,
  (req, res) => {
    const applications = [
      {
        propertyTitle: "2-Bedroom Apartment",
        propertyLocation: "Dublin",
        status: "Pending",
        statusPending: true,
        submittedAt: "2026-01-09"
      },
      {
        propertyTitle: "Studio Flat",
        propertyLocation: "Cork",
        status: "Accepted",
        statusAccepted: true,
        submittedAt: "2026-01-08"
      }
    ];

    res.render("dashboard/applications", {
      title: "My Applications",
      user: req.session.user,
      applications
    });
  }
);

/* ================= LANDLORD MESSAGES ================= */
router.get(
  "/dashboard/landlord/messages",
  isAuthenticated,
  isLandlord,
  (req, res) => {
    const me = req.session.user.username;

    messagesModel.getUserConversations(me, (err, users) => {
      if (err) users = [];

      const conversations = users.map(u => ({
        nickname: u,
        initials: u.slice(0, 2).toUpperCase(),
        isActive: false
      }));

      res.render("dashboard/landlord_messages", {
        title: "Messages",
        user: req.session.user,
        conversations,
        activeChat: null,
        messages: []
      });
    });
  }
);

router.get(
  "/dashboard/landlord/messages/:username",
  isAuthenticated,
  isLandlord,
  (req, res) => {
    const me = req.session.user.username;
    const otherUser = req.params.username;

    messagesModel.getUserConversations(me, (err, users) => {
      if (err) users = [];

      const conversations = users.map(u => ({
        nickname: u,
        initials: u.slice(0, 2).toUpperCase(),
        isActive: u === otherUser
      }));

      messagesModel.getConversation(me, otherUser, (err, msgs) => {
        if (err) msgs = [];

        const messages = msgs.map(m => ({
          content: m.content,
          isMine: m.from === me,
          timestamp: new Date(m.createdAt).toLocaleString()
        }));

        messagesModel.markAsRead(otherUser, me, (err2) => {
          if (err2) console.error(err2);
        });

        res.render("dashboard/landlord_messages", {
          title: "Messages",
          user: req.session.user,
          conversations,
          activeChat: otherUser,
          messages
        });
      });
    });
  }
);

router.post(
  "/dashboard/landlord/messages/send",
  isAuthenticated,
  isLandlord,
  (req, res) => {
    const me = req.session.user.username;
    const { to, content } = req.body;

    if (!to || !content) return res.status(400).send("Recipient and content required");

    messagesModel.sendMessage(me, to, content, (err) => {
      if (err) return res.status(500).send("Failed to send message");

      res.redirect(`/dashboard/landlord/messages/${to}`);
    });
  }
);

/* ================= TENANT MESSAGES ================= */
router.get("/dashboard/messages", isAuthenticated, isTenant, (req, res) => {
  const me = req.session.user.username;

  messagesModel.getUserConversations(me, (err, users) => {
    if (err) users = [];

    const conversations = users.map(u => ({
      nickname: u,
      initials: u.slice(0, 2).toUpperCase(),
      isActive: false
    }));

    res.render("dashboard/messages", {
      title: "Messages",
      user: req.session.user,
      conversations,
      activeChat: null,
      messages: []
    });
  });
});

router.get(
  "/dashboard/messages/:username",
  isAuthenticated,
  isTenant,
  (req, res) => {
    const me = req.session.user.username;
    const otherUser = req.params.username;

    messagesModel.getUserConversations(me, (err, users) => {
      if (err) users = [];

      const conversations = users.map(u => ({
        nickname: u,
        initials: u.slice(0, 2).toUpperCase(),
        isActive: u === otherUser
      }));

      messagesModel.getConversation(me, otherUser, (err, msgs) => {
        if (err) msgs = [];

        const messages = msgs.map(m => ({
          content: m.content,
          isMine: m.from === me,
          timestamp: new Date(m.createdAt).toLocaleString()
        }));

        messagesModel.markAsRead(otherUser, me, (err2) => {
          if (err2) console.error(err2);
        });

        res.render("dashboard/messages", {
          title: "Messages",
          user: req.session.user,
          conversations,
          activeChat: otherUser,
          messages
        });
      });
    });
  }
);

router.post("/dashboard/messages/send", isAuthenticated, isTenant, (req, res) => {
  const me = req.session.user.username;
  const { to, content } = req.body;

  if (!to || !content) {
    return res.status(400).send("Recipient and content are required");
  }

  messagesModel.sendMessage(me, to, content, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Failed to send message");
    }
    res.redirect(`/dashboard/messages/${to}`);
  });
});

/* ================= EXPORT ================= */
module.exports = router;

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

// MODELS
const listingModel = require("../models/listingModel");
const userDAO = require("../models/userModel");
const messagesModel = require("../models/messagesModel");

// CONTROLLERS
const messagesController = require("../Controller/messagesController"); 
// ⬆️ UWAGA: folder nazywa się "Controller", więc tak MUSI być

// MIDDLEWARE
const { isAuthenticated, isLandlord, isTenant } = require("../auth/auth");

/* ================= HOME ================= */
router.get("/", (req, res) => {
  res.render("index", {
    title: "Home",
    user: req.session.user || null
  });
});

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

/* ================= LANDLORD ================= */
router.get(
  "/dashboard/landlord_dashboard",
  isAuthenticated,
  isLandlord,
  (req, res) => {
    const landlord = req.session.user.username;
    const listings = listingModel.getByLandlord(landlord);

    res.render("dashboard/landlord_dashboard", {
      title: "Landlord Dashboard",
      user: req.session.user,
      activeListings: listings.filter(l => l.status === "Active").length,
      pendingRequests: listings.filter(l => l.status === "Pending").length,
      messages: 0
    });
  }
);

router.get(
  "/dashboard/landlord/my_listings",
  isAuthenticated,
  isLandlord,
  (req, res) => {
    const landlord = req.session.user.username;
    const listings = listingModel.getByLandlord(landlord);

    res.render("dashboard/my_listings", {
      title: "My Listings",
      user: req.session.user,
      listings
    });
  }
);

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
  (req, res) => {
    const { title, location, status } = req.body;

    listingModel.add({
      title,
      location,
      status,
      landlord: req.session.user.username
    });

    res.redirect("/dashboard/landlord_dashboard");
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
        id: 1,
        propertyTitle: "2-Bedroom Apartment",
        propertyLocation: "Dublin",
        status: "Pending",
        statusPending: true,
        statusAccepted: false,
        statusRejected: false,
        submittedAt: "2026-01-09"
      },
      {
        id: 2,
        propertyTitle: "Studio Flat",
        propertyLocation: "Cork",
        status: "Accepted",
        statusPending: false,
        statusAccepted: true,
        statusRejected: false,
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



/* ================= TENANT ================= */
router.get(
  "/dashboard/tenant_dashboard",
  isAuthenticated,
  isTenant,
  (req, res) => {
    res.render("dashboard/tenant_dashboard", {
      title: "Tenant Dashboard",
      user: req.session.user,
      savedListings: 0,
      applicationsSent: 0,
      messages: 0
    });
  }
);

/* ================= MESSAGES ================= */

/* LISTA ROZMÓW */
router.get("/dashboard/messages", isAuthenticated, (req, res) => {
  const me = req.session.user.username;
  const conversations = messagesModel.getUserConversations(me);

  res.render("dashboard/messages", {
    title: "Messages",
    user: req.session.user,
    conversations: conversations.map(u => ({
      nickname: u,
      initials: u.slice(0, 2).toUpperCase()
    })),
    activeChat: null,
    messages: []
  });
});

/* KONKRETNA ROZMOWA */
router.get("/dashboard/messages/:username", isAuthenticated, (req, res) => {
  const me = req.session.user.username;
  const otherUser = req.params.username;

  const conversations = messagesModel.getUserConversations(me);
  const messages = messagesModel.getConversation(me, otherUser);

  res.render("dashboard/messages", {
    title: "Messages",
    user: req.session.user,
    conversations: conversations.map(u => ({
      nickname: u,
      initials: u.slice(0, 2).toUpperCase()
    })),
    activeChat: otherUser,
    messages
  });
});

/* WYSYŁANIE WIADOMOŚCI */
router.post(
  "/dashboard/messages/send",
  isAuthenticated,
  messagesController.sendMessage
);

module.exports = router;

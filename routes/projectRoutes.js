const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

// MODELS
const listingModel = require("../models/listingModel");
const userDAO = require("../models/userModel");
const messagesModel = require("../models/messagesModel");

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

/* ================= LANDLORD DASHBOARD ================= */
router.get(
  "/dashboard/landlord_dashboard",
  isAuthenticated,
  isLandlord,
  (req, res) => {
    const landlord = req.session.user.username;
    const listings = listingModel.getByLandlord(landlord) || [];

    messagesModel.countUnread(landlord, (err, unreadCount) => {
      if (err) unreadCount = 0;

      res.render("dashboard/landlord_dashboard", {
        title: "Landlord Dashboard",
        user: req.session.user,
        activeListings: listings.filter(l => l.status === "Active").length,
        pendingRequests: listings.filter(l => l.status === "Pending").length,
        messages: unreadCount
      });
    });
  }
);

/* ================= LANDLORD MY LISTINGS ================= */
router.get(
  "/dashboard/landlord/my_listings",
  isAuthenticated,
  isLandlord,
  (req, res) => {
    const landlord = req.session.user.username;
    const listings = listingModel.getByLandlord(landlord) || [];

    res.render("dashboard/my_listings", {
      title: "My Listings",
      user: req.session.user,
      listings
    });
  }
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
  (req, res) => {
    const landlord = req.session.user.username;
    const { title, location, price } = req.body;

    listingModel.createListing({
      title,
      location,
      price,
      landlord,
      status: "Pending"
    });

    res.redirect("/dashboard/landlord/my_listings");
  }
);

/* ================= TENANT DASHBOARD ================= */
router.get(
  "/dashboard/tenant_dashboard",
  isAuthenticated,
  isTenant,
  (req, res) => {
    const tenant = req.session.user.username;

    messagesModel.countUnread(tenant, (err, unreadCount) => {
      if (err) unreadCount = 0;

      res.render("dashboard/tenant_dashboard", {
        title: "Tenant Dashboard",
        user: req.session.user,
        savedListings: 0,
        applicationsSent: 0,
        messages: unreadCount
      });
    });
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

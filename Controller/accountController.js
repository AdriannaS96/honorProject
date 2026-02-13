const userDAO = require("../models/userModel");
const listingDAO = require("../models/listingModel");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// SHOW account page
exports.showAccount = (req, res) => {
  res.render("dashboard/account", {
    title: "My Account",
    user: req.session.user
  });
};

// UPDATE email
exports.updateEmail = (req, res) => {
  const { email } = req.body;
  const username = req.session.user.username;

  if (!email) {
    return res.render("dashboard/account", {
      error: "Email cannot be empty",
      user: req.session.user
    });
  }

  // check if email already exists
  userDAO.findByEmail(email, (err, existingUser) => {
    if (existingUser) {
      return res.render("dashboard/account", {
        error: "Email already in use",
        user: req.session.user
      });
    }

    userDAO.updateEmail(username, email, err => {
      if (err) {
        return res.render("dashboard/account", {
          error: "Failed to update email",
          user: req.session.user
        });
      }

      // IMPORTANT: update session
      req.session.user.email = email;

      res.render("dashboard/account", {
        success: "Email updated successfully",
        user: req.session.user
      });
    });
  });
};

// UPDATE password
exports.updatePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const username = req.session.user.username;

  if (!currentPassword || !newPassword) {
    return res.render("dashboard/account", {
      error: "All fields are required",
      user: req.session.user
    });
  }

  userDAO.findByUsername(username, async (err, user) => {
    if (!user) return res.redirect("/logout");

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.render("dashboard/account", {
        error: "Current password is incorrect",
        user: req.session.user
      });
    }

    if (newPassword.length < 8) {
      return res.render("dashboard/account", {
        error: "Password must be at least 8 characters",
        user: req.session.user
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    userDAO.updatePassword(username, hash, err => {
      if (err) {
        return res.render("dashboard/account", {
          error: "Failed to update password",
          user: req.session.user
        });
      }

      res.render("dashboard/account", {
        success: "Password updated successfully",
        user: req.session.user
      });
    });
  });
};
// DELETE account
exports.deleteAccount = (req, res) => {
  const username = req.session.user.username;

 (async () => {
    try {
      const listings = await listingDAO.getByLandlord(username);

      listings.forEach(listing => {
        if (!listing.images || listing.images.length === 0) return;

        listing.images.forEach(img => {
          const cleanUrl = img.url.startsWith("/") ? img.url.slice(1) : img.url;
          const filePath = path.join(__dirname, "..", "public", cleanUrl);

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      });

      await listingDAO.removeByLandlord(username);

      userDAO.deleteUser(username, (err, numRemoved) => {
        if (err || numRemoved === 0) {
          return res.render("dashboard/account", {
            error: "Failed to delete account",
            user: req.session.user
          });
        }

        req.session.destroy(() => {
          res.redirect("/");
        });
      });
    } catch (err) {
      console.error("❌ deleteAccount error:", err);
      return res.render("dashboard/account", {
        error: "Failed to delete account",
        user: req.session.user
      });
    }
 })();
};


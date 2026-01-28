const userDAO = require("../models/userModel");
const bcrypt = require("bcrypt");

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

  userDAO.updateEmail(username, email, err => {
    if (err) {
      return res.render("dashboard/account", {
        error: "Failed to update email",
        user: req.session.user
      });
    }

    res.render("account/account", {
      success: "Email updated successfully",
      user: req.session.user
    });
  });
};

// UPDATE password
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const username = req.session.user.username;

  userDAO.findByUsername(username, async (err, user) => {
    if (!user) return res.redirect("/logout");

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.render("account/account", {
        error: "Current password is incorrect",
        user: req.session.user
      });
    }

    if (newPassword.length < 8) {
      return res.render("account/account", {
        error: "Password must be at least 8 characters",
        user: req.session.user
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    userDAO.updatePassword(username, hash, () => {
      res.render("account/account", {
        success: "Password updated successfully",
        user: req.session.user
      });
    });
  });
};


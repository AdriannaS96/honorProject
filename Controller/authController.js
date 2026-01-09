//Controller/authController.js
const UserDAO = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.showLogin = (req, res) => {
  res.render("user/login", { title: "Login" });
};

exports.showRegister = (req, res) => {
  res.render("user/register", { title: "Register" });
};

exports.registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  UserDAO.findByUsername(username, async (err, user) => {
    if (user) {
      return res.render("user/register", { error: "User already exists" });
    }

    await UserDAO.create(username, password, role);
    res.redirect("/login");
  });
};

exports.loginUser = (req, res) => {
  const { username, password } = req.body;

  UserDAO.findByUsername(username, async (err, user) => {
    if (!user) {
      return res.render("user/login", { error: "User not found" });
    }

    const match = await UserDAO.comparePassword(password, user.password);
    if (!match) {
      return res.render("user/login", { error: "Wrong password" });
    }

    // SESSION
    req.session.user = {
      username: user.username,
      role: user.role
    };

    // REDIRECT BY ROLE
    if (user.role === "landlord") {
      res.redirect("/dashboard/landlord_dashboard");
    } else {
      res.redirect("/dashboard/tenant_dashboard");
    }
  });
};

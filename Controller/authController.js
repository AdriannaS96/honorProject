const UserDAO = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.showLogin = (req, res) => {
  res.render("user/login", { title: "Login" });
};

exports.showRegister = (req, res) => {
  res.render("user/register", { title: "Register" });
};

exports.registerUser = async (req, res) => {
  const { username, email, password, repeatPassword, role } = req.body;

  // 1️⃣ basic validation
  if (!username || !email || !password || !repeatPassword || !role) {
    return res.render("user/register", {
      error: "All fields are required"
    });
  }

  if (password !== repeatPassword) {
    return res.render("user/register", {
      error: "Passwords do not match"
    });
  }

  if (password.length < 8) {
    return res.render("user/register", {
      error: "Password must be at least 8 characters long"
    });
  }

  // 2️⃣ check username
  UserDAO.findByUsername(username, (err, existingUser) => {
    if (existingUser) {
      return res.render("user/register", {
        error: "Username already exists"
      });
    }

    // 3️⃣ check email
    UserDAO.findByEmail(email, async (err, existingEmail) => {
      if (existingEmail) {
        return res.render("user/register", {
          error: "Email already registered"
        });
      }

      // 4️⃣ create user
      await UserDAO.create(username, email, password, role);
      res.redirect("/login");
    });
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

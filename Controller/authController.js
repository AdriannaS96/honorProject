const UserDAO = require("../models/userModel");
const MIN_PASSWORD_LENGTH = 8;

const renderRegisterWithError = (res, error, formData = {}) =>
  res.render("user/register", {
    title: "Register",
    error,
    formData
  });

const renderLoginWithError = (res, error) =>
  res.render("user/login", {
    title: "Login",
    error
  });

const findUserByUsername = username =>
  new Promise((resolve, reject) => {
    UserDAO.findByUsername(username, (err, user) => {
      if (err) return reject(err);
      resolve(user);
    });
  });

const findUserByEmail = email =>
  new Promise((resolve, reject) => {
    UserDAO.findByEmail(email, (err, user) => {
      if (err) return reject(err);
      resolve(user);
    });
  });

const findUserByIdentifier = identifier =>
  new Promise((resolve, reject) => {
    UserDAO.findByUsernameOrEmail(identifier, (err, user) => {
      if (err) return reject(err);
      resolve(user);
    });
  });

exports.showLogin = (req, res) => {
  res.render("user/login", { title: "Login" });
};

exports.showRegister = (req, res) => {
  res.render("user/register", { title: "Register" });
};

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, repeatPassword, role } = req.body;
    const formData = { username, email, role };

    if (!username || !email || !password || !repeatPassword || !role) {
      return renderRegisterWithError(res, "All fields are required", formData);
    }

    if (password !== repeatPassword) {
      return renderRegisterWithError(res, "Passwords do not match", formData);
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return renderRegisterWithError(
        res,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
        formData
      );
    }

    const [existingUser, existingEmail] = await Promise.all([
      findUserByUsername(username),
      findUserByEmail(email)
    ]);

    if (existingUser) {
      return renderRegisterWithError(res, "Username already exists", formData);
    }

    if (existingEmail) {
      return renderRegisterWithError(res, "Email already registered", formData);
    }

    await UserDAO.create(username, email, password, role);
    return res.redirect("/login");
  } catch (err) {
    console.error("❌ registerUser error:", err);
    return renderRegisterWithError(res, "Unexpected server error");
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, identifier, password } = req.body;
    const loginValue = identifier || username;
    const user = await findUserByIdentifier(loginValue);

    if (!user) {
      return renderLoginWithError(res, "User not found");
    }

    const match = await UserDAO.comparePassword(password, user.password);
    if (!match) {
      return renderLoginWithError(res, "Wrong password");
    }

    req.session.user = {
      username: user.username,
      role: user.role
    };

    if (user.role === "landlord") {
      return res.redirect("/dashboard/landlord_dashboard");
    }

    return res.redirect("/dashboard/tenant_dashboard");
  } catch (err) {
    console.error("❌ loginUser error:", err);
    return renderLoginWithError(res, "Unexpected server error");
  }
};
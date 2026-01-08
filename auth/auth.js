//Auth.js
exports.isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

exports.isLandlord = (req, res, next) => {
  if (req.session.user.role !== "landlord") {
    return res.status(403).send("Access denied");
  }
  next();
};

exports.isTenant = (req, res, next) => {
  if (req.session.user.role !== "tenant") {
    return res.status(403).send("Access denied");
  }
  next();
};

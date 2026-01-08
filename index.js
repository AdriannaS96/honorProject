const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const mustache = require("mustache-express");

const app = express();


app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));


app.use(
  session({
    secret: "very_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.username = req.session.user ? req.session.user.username : null;

  res.locals.isLandlord = req.session.user?.role === "landlord";
  res.locals.isTenant = req.session.user?.role === "tenant";

  next();
});

app.use(express.static(path.join(__dirname, "public")));

// Mustache
app.engine("mustache", mustache());
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "public", "views"));

// Routes
const routes = require("./routes/projectRoutes");
app.use(routes);

// 404
app.use((req, res) => res.status(404).send("404 Not Found"));

// Start server
app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);

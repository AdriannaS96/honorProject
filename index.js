const express = require("express");
const cookieParser = require('cookie-parser');
const path = require("path");
require('dotenv').config();

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); 

const mustache = require("mustache-express");
app.engine("mustache", mustache());
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "public", "views")); 

const routes = require("./routes/projectRoutes.js"); 
app.use(routes); 

app.use((req, res, next) => {
  res.status(404).send("404 Not Found");
});

app.listen(3000, () => {
    console.log('Server started on port 3000. Ctrl^c to quit.');
});

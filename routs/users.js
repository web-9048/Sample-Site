var express = require("express"),
  router = express.Router(),
  passport = require("passport"),
  User = require("../models/users"),
  Blogs = require("../models/products"),
  middleware = require("../middleware/middleware"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose");

router.get("/register", function (req, res) {
  res.render("register.ejs");
});
passport.use(new LocalStrategy(User.authenticate()));
router.post("/products/register", function (req, res) {
  console.log(req.body);
  if (req.body.adminCode == "mallow43") {
    User.register(
      new User({
        name: req.body.name,
        username: req.body.email,
        isAdmin: true,
      }),
      req.body.password,
      function (err, user) {
        if (err) {
          req.flash("error", err.message);
          res.render("register.ejs");
        }

        passport.authenticate("local")(req, res, function () {
          req.flash("success", "Welcome to Lucias Site");
          res.redirect("/products");
        });
      }
    );
  } else {
    User.register(
      new User({
        name: req.body.name,
        username: req.body.username,
        address: req.body.address,
      }),
      req.body.password,
      function (err, user) {
        if (err && err !== null) {
          req.flash("error", err.message);
          res.redirect("/register");
        }
        // res.redirect("/products");

        passport.authenticate("local", {
          failureRedirect: "/login",
          failureFlash: true,
        })(req, res, function () {
          console.log("user");
          req.flash("success", "Welcome to Lucias Site");
          res.redirect("/products");
        });
      }
    );
  }
});
router.get("/login", function (req, res) {
  res.render("login.ejs");
});
router.post(
  "/products/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {
    req.flash("success", "Logged In Successfully");

    res.redirect("/products");
  }
);

router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success", "Logged Out Successfully");

  res.redirect("/products");
});
module.exports = router;

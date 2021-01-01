var express = require("express"),
  router = express.Router(),
  middleware = require("../middleware/middleware"),
  User = require("../models/users"),
  Product = require("../models/products");

router.get("/products/:id", function (req, res) {
  Product.findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundProduct) {
      if (err) {
        console.log(err);
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        res.render("show.ejs", { product: foundProduct });
      }
    });
});
router.get("/", function (req, res) {
  res.render("home.ejs");
});
router.get("/products", function (req, res) {
  Product.find({}, function (err, products) {
    if (err) {
      console.log(err);
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      res.render("products.ejs", { products: products });
    }
  });
});
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("form.ejs");
});
router.post("/products/new", middleware.isLoggedIn, function (req, res) {
  var title = req.body.title;
  var image = req.body.image;
  var body = req.body.body;
  Product.create(
    {
      title: title,
      image: image,
      body: body,
      price: req.body.price,
      author: {
        username: req.user.name,
        id: req.user.id,
      },
    },
    function (err, product) {
      if (err) {
        console.log(err);
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        res.redirect("/products");
      }
    }
  );
});

router.get("/products/:id", function (req, res) {
  Product.findById(req.params.id)
    .populate("comments")
    .exec(function (err, product) {
      if (err) {
        console.log(err);
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        res.render("show.ejs", { product: product });
      }
    });
});
router.get("/products/:id/edit", middleware.blogOwnership, function (req, res) {
  Product.findById(req.params.id, function (err, product) {
    if (err) {
      console.log(err);
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      res.render("edit.ejs", { product: product });
    }
  });
});
router.put("/products/:id", middleware.blogOwnership, function (req, res) {
  Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    function (err, newProduct) {
      if (err) {
        console.log(err);
        req.flash("error", err.message);
        res.redirect("/products");
      } else {
        console.log(newProduct);
        console.log(req.body.product);

        res.redirect("/products/" + req.params.id);
      }
    }
  );
});

router.delete("/products/:id", middleware.blogOwnership, function (req, res) {
  Blogs.remove({ _id: req.params.id }, function (err, product) {
    if (err) {
      console.log(err);
      req.flash("error", err.message);
      res.redirect("/");
    } else {
      res.redirect("/products");
    }
  });
});
module.exports = router;

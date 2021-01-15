var express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    User = require('../models/users'),
    Product = require('../models/products'),
    middleware = require('../middleware/middleware'),
    LocalStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose');

router.get('/register', function (req, res) {
    res.render('register.ejs');
});
passport.use(new LocalStrategy(User.authenticate()));
router.post('/products/register', function (req, res) {
    console.log(req.body);
    if (req.body.adminCode == 'mallow43') {
        User.register(
            new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                address: {
                    streetAddress: req.body.address,
                    postalCode: req.body.postalCode,
                    country: req.body.country,
                    state: req.body.state,
                    apartmentNum: req.body.apt,
                },
                username: req.body.email,
                isAdmin: true,
            }),
            req.body.password,
            function (err, user) {
                if (err) {
                    req.flash('error', err.message);
                    res.render('register.ejs');
                }

                passport.authenticate('local')(req, res, function () {
                    req.flash('success', 'Welcome to Lucias Site');
                    res.redirect('/products');
                });
            },
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
                    req.flash('error', err.message);
                    res.redirect('/register');
                }
                // res.redirect("/products");

                passport.authenticate('local', {
                    failureRedirect: '/login',
                    failureFlash: true,
                })(req, res, function () {
                    console.log('user');
                    req.flash('success', 'Welcome to Lucias Site');
                    res.redirect('/products');
                });
            },
        );
    }
});
router.get('/login', function (req, res) {
    res.render('login.ejs');
});
router.post(
    '/products/login',
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true,
    }),
    function (req, res) {
        req.flash('success', 'Logged In Successfully');

        res.redirect('/products');
    },
);

router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'Logged Out Successfully');

    res.redirect('/products');
});
router.get('/users/:id', middleware.isLoggedIn, function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            req.flash('error', err.message);
            res.redirect('/products');
        } else {
            if (req.user._id.equals(req.params.id) || req.user.isAdmin) {
                console.log(user.products);
                res.render('user.ejs', { user: user });
            } else {
                req.flash('error', 'Dont Have Authority, Sorry :(');
                res.redirect('/products');
            }
        }
    });
});
router.get('/users/:id/past_orders', middleware.isLoggedIn, function (req, res) {
    User.findById(req.params.id)
        .populate({
            path: 'orders',
            match: { delivered: true },

            populate: {
                path: 'products.id',
                ref: 'Product',
            },
        })
        .exec(function (err, user) {
            if (err) {
                req.flash('error', err.message);
                res.redirect('/products');
            } else {
                res.render('usersOrders.ejs', { user: user, title: 'Past', past: true });
            }
        });
});
router.get('/users/:id/pending_orders', middleware.isLoggedIn, function (req, res) {
    User.findById(req.params.id)
        .populate({
            path: 'orders',
            match: { delivered: false },
            populate: {
                path: 'products.id',
                ref: 'Product',
            },
        })
        .exec(function (err, user) {
            if (err) {
                req.flash('error', err.message);
                res.redirect('/products');
            } else {
                res.render('usersOrders.ejs', { user: user, title: 'Pending', past: false });
            }
        });
});
module.exports = router;

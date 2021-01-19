const User = require('../models/users');
const mongoose = require('mongoose');
var express = require('express'),
    router = express.Router(),
    middleware = require('../middleware/middleware'),
    Products = require('../models/products'),
    middleware = require('../middleware/middleware');

router.get(
    '/cart',
    middleware.isLoggedIn,
    // middleware.itemInCart,
    function (req, res) {
        User.findById(req.user.id)
            .populate('products.id')
            .exec(function (err, user) {
                if (err) {
                    req.flash('error', err.message);
                    res.redirect('back');
                }
                let arr = [];
                user.products.map((p) => {
                    if (p.id !== null) {
                        arr.push(p);
                    }
                });
                res.render('cart.ejs', {
                    products: arr,
                });
            });
    },
);
router.post('/products/:id/add', middleware.isLoggedIn, function (req, res) {
    User.findById(req.user._id, function (err, user) {
        if (err) {
            req.flash('error', err.message);
            res.redirect('back');
        }
        Products.findById(req.params.id, function (err, product) {
            if (err) {
                req.flash('error', err.message);
                res.redirect('back');
            }
            if (user.products.length === 0) {
                user.products.push({ id: product._id, quantity: 1 });
                user.save();
                req.flash('success', 'Successfully Added To Cart');
                res.redirect('/cart');
            } else {
                user.products.forEach(function (p) {
                    if (product._id.equals(p.id)) {
                        user.products[user.products.indexOf(p)].quantity += 1;
                        user.save();
                    } else {
                        if (user.products.length - 1 === user.products.indexOf(p)) {
                            user.products.push({ id: product._id, quantity: 1 });
                            user.save();
                        }
                    }
                });

                req.flash('success', 'Successfully Added To Cart');
                res.redirect('/cart');
            }
        });
    });
});
router.post('/cart/update', middleware.itemInCart, function (req, res) {
    User.findById(req.user._id, function (err, user) {
        if (err) {
            req.flash('error', err.message);
            res.send('error');
        }
        let products = [];

        JSON.parse(req.body.products).forEach(function (prod) {
            products.push({
                id: mongoose.Types.ObjectId(prod.id),
                quantity: prod.quantity,
            });
        });
        user.products = products;
        user.save();
        // req.flash("success", "updated ")
        res.send('success');
    });
});
router.post('/cart/:id/delete', middleware.itemInCart, function (req, res) {
    User.findById(req.user._id, function (err, user) {
        if (err) {
            req.flash('error', err.message);
            res.send('error');
        }

        user.products.forEach(function (prod) {
            if (mongoose.Types.ObjectId(prod.id).equals(req.params.id)) {
                user.products.splice(user.products.indexOf(prod), 1);
            }
        });
        user.save();
        // req.flash("success", "updated ")
        res.send('success');
    });
});

module.exports = router;

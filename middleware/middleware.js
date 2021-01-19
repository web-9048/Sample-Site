var express = require('express'),
    Products = require('../models/products'),
    User = require('../models/users'),
    flash = require('connect-flash');
var middleware = {};
middleware.productOwnership = function (req, res, next) {
    console.log(req.user);
    Products.findById(req.params.id, function (err, product) {
        if (err) {
            res.redirect('back');
        } else {
            if (!req.user) {
                req.flash('error', 'Please Log in First');
                res.redirect('/login');
            } else {
                if (product.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    flash('error', 'You are not authorized to make this change.');
                    res.redirect('/products/' + product._id);
                }
            }
        }
    });
};
middleware.commentOwnership = function (req, res, next) {
    console.log(req.user);
    Comment.findById(req.params.comment_id, function (err, product) {
        if (err) {
            res.redirect('back');
        } else {
            if (!req.user) {
                req.flash('error', 'Please Log in First');
                res.redirect('/login');
            } else {
                if (product.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash('error', 'You are not authorized to make this change.');
                    res.redirect('/login');
                }
            }
        }
    });
};
middleware.isLoggedIn = function (req, res, next) {
    if (req.user) {
        next();
    } else {
        req.flash('error', 'Please Log in First');
        res.redirect('/login');
    }
};
middleware.isAdmin = function (req, res, next) {
    if (req.user) {
        if (req.user.isAdmin) {
            next();
        } else {
            req.flash('error', 'You dont have the authority to perform this action');
            res.redirect('/login');
        }
    } else {
        req.flash('error', 'Please Log in First');
        res.redirect('/login');
    }
};
middleware.itemInCart = function (req, res, next) {
    User.findById(req.user._id, function (err, user) {
        if (user.products.length > 0) {
            next();
        } else {
            req.flash('error', 'Your Cart is Empty Add Some Items First');
            res.redirect('/products');
        }
    });
};
module.exports = middleware;

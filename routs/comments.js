var express = require('express'),
    router = express.Router(),
    middleware = require('../middleware/middleware'),
    Comment = require('../models/comments'),
    Products = require('../models/products');

router.get('/products/:id/comments/new', middleware.isLoggedIn, function (req, res) {
    Products.findById(req.params.id, function (err, product) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/products');
        } else {
            res.render('commentForm.ejs', { product: product });
        }
    });
});
router.post('/products/:id/comments/new', middleware.isLoggedIn, function (req, res) {
    Products.findById(req.params.id, function (err, product) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/');
        } else {
            var com = new Comment({
                author: {
                    id: req.user._id,
                    username: req.user.firstName + ' ' + req.user.lastName,
                },
                text: req.body.text,
            });
            Comment.create(com, function (err, comment) {
                if (err) {
                    req.flash('error', err.message);
                    res.redirect(back);
                } else {
                    product.comments.push(comment);
                    product.save();
                    req.flash('success', 'Comment Created!');
                    res.redirect('/products/' + req.params.id);
                }
            });
        }
    });
});
router.get('/products/:id/comments/:comment_id/edit', middleware.commentOwnership, function (req, res) {
    Comment.findById(req.params.comment_id, function (err, comment) {
        if (err) {
            req.flash('error', err.message);
            res.redirect('back');
        } else {
            res.render('commentEdit.ejs', {
                comment: comment,
                blog_id: req.params.id,
            });
        }
    });
});
router.put('/products/:id/comments/:comment_id/', middleware.commentOwnership, function (req, res) {
    var com123 = {
        text: req.body.text,
    };
    var updatedCom = {
        text: req.body.text,
    };
    Comment.findByIdAndUpdate(req.params.comment_id, updatedCom, function (err, comment) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);

            res.redirect('/products' + req.params.id);
        } else {
            res.redirect('/products' + req.params.id);
        }
    });
});
router.get('/products/:id/comments/:comment_id/delete', middleware.commentOwnership, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err, comment) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/products/' + req.params.id);
        } else {
            res.redirect('/products/' + req.params.id);
        }
    });
});
module.exports = router;

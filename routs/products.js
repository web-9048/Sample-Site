var express = require('express'),
    router = express.Router(),
    middleware = require('../middleware/middleware'),
    User = require('../models/users'),
    Product = require('../models/products');
const multer = require('multer');

router.get('/products/:id', function (req, res) {
    Product.findById(req.params.id)
        .populate('comments')
        .exec(function (err, foundProduct) {
            if (err) {
                console.log(err);
                req.flash('error', err.message);
                return res.redirect('back');
            } else {
                res.render('show.ejs', { product: foundProduct });
            }
        });
});
router.get('/', function (req, res) {
    res.render('home.ejs');
});
router.get('/products', function (req, res) {
    Product.find({}, function (err, products) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            return res.redirect('back');
        } else {
            res.render('products.ejs', { products: products });
        }
    });
});
router.get('/new', middleware.isLoggedIn, function (req, res) {
    res.render('form.ejs');
});

var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    },
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.C_API_KEY,
    api_secret: process.env.C_API_SECRET,
});
router.post('/products/new', middleware.isLoggedIn, upload.single('image'), function (req, res) {
    var title = req.body.title;

    var body = req.body.body;
    cloudinary.uploader.upload(req.file.path, function (result) {
        var image = result.secure_url;

        Product.create(
            {
                title: title,
                image: {
                    url: image,
                    id: result.public_id,
                },
                body: body,
                price: req.body.price,
                author: {
                    username: req.user.firstName + ' ' + req.user.lastName,
                    id: req.user.id,
                },
            },
            function (err, product) {
                if (err) {
                    console.log(err);
                    req.flash('error', err.message);
                    return res.redirect('back');
                } else {
                    return res.redirect('/products');
                }
            },
        );
    });
});

router.get('/products/:id', function (req, res) {
    Product.findById(req.params.id)
        .populate('comments')
        .exec(function (err, product) {
            if (err) {
                console.log(err);
                req.flash('error', err.message);
                return res.redirect('back');
            } else {
                res.render('show.ejs', { product: product });
            }
        });
});
router.get('/products/:id/edit', middleware.productOwnership, function (req, res) {
    Product.findById(req.params.id, function (err, product) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            return res.redirect('back');
        } else {
            res.render('edit.ejs', { product: product });
        }
    });
});
router.put('/products/:id', middleware.productOwnership, upload.single('image'), async function (req, res) {
    Product.findById(req.params.id, async function (err, product) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            return res.redirect('/products');
        } else {
            if (req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(product.id);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    product.image = { id: result.public_id, url: result.secure_url };
                } catch (err) {
                    req.flash('error', err.message);
                    return res.redirect('back');
                }
            }
            product.name = req.body.name;
            product.body = req.body.body;
            product.save();
            console.log(product);
            req.flash('success', 'Successfully Updated!');
            return res.redirect('/products/' + product._id);
        }
    });
});

router.delete('/products/:id', middleware.productOwnership, function (req, res) {
    Product.findById(req.params.id, async function (err, p) {
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            return res.redirect('/products');
        }
        console.log(p);
        Product.remove({ _id: req.params.id }, async function (err, product) {
            if (err) {
                console.log(err);
                req.flash('error', err.message);
                return res.redirect('/products');
            } else {
                try {
                    console.log(product);
                    await cloudinary.v2.uploader.destroy(p.image.id);
                } catch (err) {
                    console.log(err);
                    req.flash('error', err.message);
                    return res.redirect('/products');
                }

                return res.redirect('/products');
            }
        });
    });
});
module.exports = router;

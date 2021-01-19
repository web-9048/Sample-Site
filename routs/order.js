const User = require('../models/users');
const mongoose = require('mongoose');
var express = require('express'),
    router = express.Router(),
    middleware = require('../middleware/middleware'),
    Products = require('../models/products'),
    middleware = require('../middleware/middleware');

const Stripe = require('stripe');
const Order = require('../models/order');
const stripe = Stripe(process.env.STRIPE_KEY);
const { body, validationResult } = require('express-validator');

router.post('/checkout', middleware.isLoggedIn, async function (req, res) {
    console.log(req.body);
    let price = 0;
    if (!req.body.products) {
        req.flash('error', 'Something Went Wrong, Please Try Again');
        res.redirect('/products');
    }
    JSON.parse(req.body.products).map((x) => (price += x.id.price));
    const paymentIntent = await stripe.paymentIntents.create({
        amount: price * 100,
        currency: 'usd',
        // Verify your integration in this guide by including this parameter
        metadata: { integration_check: 'accept_a_payment' },
    });
    if (req.body.products) {
        res.render('paymentForm.ejs', {
            products: JSON.parse(req.body.products),
            client_secret: paymentIntent.id,
        });
    } else {
        req.flash('error', 'Ur Being Weird Man');
        res.redirect('back');
    }
});
router.post('/charge', middleware.isLoggedIn, middleware.itemInCart, async (req, res) => {
    let p;
    try {
        p = await stripe.paymentIntents.retrieve(req.body.clientSecret);
    } catch (e) {
        console.log(e);
        req.flash('error', e.message);
        res.redirect('/products');
    }
    stripe.customers
        .create({
            name: req.body.nameCard,
            email: req.body.email,
            source: req.body.stripeToken,
        })
        .then((customer) => {
            let price = 0;
            JSON.parse(req.body.products).map((x) => (price += x.id.price * x.quantity));
            stripe.charges
                .create({
                    amount: price * 100,
                    receipt_email: req.body.email,
                    currency: 'usd',
                    customer: customer.id,
                })
                .then((charge) => {
                    let arr = [];

                    JSON.parse(req.body.products).map((x) => arr.push({ quantity: x.quantity, id: x.id._id }));

                    let or = new Order({
                        recipient: req.user._id,
                        products: arr,
                        totalPrice: price,
                        shippingAddress: {
                            streetAddress: req.body.address,
                            postalCode: req.body.postalCode,
                            country: req.body.country,
                            state: req.body.state,
                            apartmentNum: req.body.apt,
                        },
                        arrivalTime: 'TBD Withing 3 business days of the placement of this order.',
                        chargeId: charge.id,
                    });

                    Order.create(or, function (err, product) {
                        if (err) {
                            console.log(err);
                            req.flash('error', err.message);
                            res.redirect('back');
                        } else {
                            User.findById(req.user._id, function (err, user) {
                                if (err) {
                                    console.log(err);
                                    req.flash('error', err.message);
                                    res.redirect('back');
                                } else {
                                    user.orders.push(or._id);
                                    user.products.map((x) => {
                                        JSON.parse(req.body.products).map((m) => {
                                            if (x._id.equals(m._id)) {
                                                user.products.splice(user.products.indexOf(x));
                                            }
                                        });
                                    });
                                    user.save();
                                    req.flash('success', 'Purchase successful');
                                    res.redirect('/users/' + req.user._id);
                                }
                            });
                        }
                    });
                });
        });
});
router.get('/placed_orders', function (req, res) {
    Order.find({ delivered: false })
        .populate('products.id')
        .exec(function (err, orders) {
            res.render('placedOrders.ejs', { orders: orders });
        });
});
router.post('/placed_orders/:id/update', function (req, res) {
    Order.findByIdAndUpdate(req.params.id, req.body, function (err, or) {
        if (err) {
            res.send(err);
        } else {
            res.send(or);
        }
    });
});

module.exports = router;

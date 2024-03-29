require('dotenv').config();

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var ejs = require('ejs');
var methodOverride = require('method-override');
var expressSanitizer = require('express-sanitizer');
(mongoose = require('mongoose')),
    (LocalStrategy = require('passport-local')),
    (passportLocalMongoose = require('passport-local-mongoose')),
    (passport = require('passport')),
    (flash = require('connect-flash'));
(Comment = require('./models/comments.js')),
    (User = require('./models/users.js')),
    (mongoSanitize = require('express-mongo-sanitize'));

var commentRouts = require('./routs/comments.js'),
    productRouts = require('./routs/products.js'),
    cartRouts = require('./routs/cart.js'),
    userRouts = require('./routs/users.js'),
    orderRouts = require('./routs/order');

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(express.static('scripts'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(flash());

app.use(
    require('express-session')({
        secret: 'Pardon Allan Turing',
        resave: false,
        saveUninitialized: false,
    }),
);

app.use(passport.initialize());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.session());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.errorMessage = req.flash('error');
    res.locals.successMessage = req.flash('success');
    next();
});

app.use(productRouts);
app.use(commentRouts);
app.use(userRouts);
app.use(cartRouts);
app.use(orderRouts);

//Comment Routs

app.listen(process.env.PORT, console.log(2000));

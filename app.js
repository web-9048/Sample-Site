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
(Comment = require('./models/comments.js')), (User = require('./models/users.js'));

var commentRouts = require('./routs/comments.js'),
    productRouts = require('./routs/products.js'),
    cartRouts = require('./routs/cart.js'),
    userRouts = require('./routs/users.js'),
    orderRouts = require('./routs/order');

// mongoose.connect(
//   "mongodb://uigh05hqkcltukk32zbj:kKOkWDw9efrKXJdeA9w4@bhpygth5x3lvaj4-mongodb.services.clever-cloud.com:27017/bhpygth5x3lvaj4",
//   { useNewUrlParser: true, useUnifiedTopology: true }
// );
// mongoose.connect('mongodb://localhost/online_shopping');
mongoose.connect('mongodb+srv://mats2:Scout2005@cluster0.jsefa.mongodb.net/online_app?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(express.static('scripts'));

app.use(bodyParser.urlencoded({ extended: true }));

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

app.listen(2000, console.log(2000));

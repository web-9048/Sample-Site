var mongoose = require('mongoose');
var productSchema = new mongoose.Schema({
    title: String,
    image: {
        url: String,
        id: String,
    },
    body: String,
    created: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        username: String,
    },
    price: Number,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
    ],
});

var Product = mongoose.model('Product', productSchema);
module.exports = Product;

var mongoose = require("mongoose");
var orderSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  products: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: Number,
    },
  ],
  totalPrice: Number,
  arrivalTime: String,
  shippingAddress: {
    postalCode: String,
    streetAddress: String,
    country: String,
    apartmentNum: String,
    state: String,
  },

  chargeId: String,
  delivered: { type: Boolean, default: false },

  created: { type: Date, default: Date.now },
});
var Order = mongoose.model("Order", orderSchema);
module.exports = Order;

var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  products: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: { type: Number, default: 1 },
    },
  ],
  address: String,
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  isAdmin: { type: Boolean, default: false },
});
userSchema.plugin(passportLocalMongoose);
var User = mongoose.model("User", userSchema);
module.exports = User;

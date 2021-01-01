const User = require("../models/users");
const mongoose = require("mongoose");
var express = require("express"),
  router = express.Router(),
  middleware = require("../middleware/middleware"),
  Products = require("../models/products"),
  middleware = require("../middleware/middleware");

const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51I4FBXK6TknWrvo2bb4mNPkmxWwHDi47XOnnXD8Iq3MhstBaK4crEsG1zj8mupcqtpeDjpdsmrH00bakWxfPp2oj00wMVJgtc2"
);
router.post("/order", async (req, res) => {
  console.log(req.body);
  let arr = [];
  JSON.parse(req.body.products).map((x) => {
    arr.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: x.title,
        },
        unit_amount: 2000,
      },
      quantity: x.quantity,
    });
  });
  let order = {
    payment_method_types: ["card"],
    line_items: arr,
    mode: "payment",
    success_url: "http://localhost:2000/order/success",
    cancel_url: "http://localhost:2000/order/cancel",
  };
  const session = await stripe.checkout.sessions.create(order);

  res.json({ id: session.id });
});

// router.get("/orders/confirm", function (req, res) {
//   res.render("order.ejs");
// });
module.exports = router;

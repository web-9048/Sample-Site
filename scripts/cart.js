let box = $(".ui.checkbox");
box.checkbox("set checked");
var products = JSON.parse($("#variableJSON").text());
$("#variableJSON").remove();

let checkedProducts = [];
let totalPrice = 0;
let productNum = 0;
let updatedProd = [];
function check(fetch) {
  checkedProducts = [];
  totalPrice = 0;
  productNum = 0;
  updatedProd = [];
  products.forEach(function (p) {
    let checkbox = $(".ui.checkbox[name =" + p.id._id + "]");
    let quantity = Number($("#first[name =Quantity" + p.id._id + "]").val());

    if (fetch) {
      updatedProd.push({
        quantity: quantity,
        id: p.id._id,
        _id: p.id,
      });

      console.log(updatedProd);
      if (updatedProd.length === products.length) {
        var settings = {
          url: "/cart/update",
          method: "POST",
          timeout: 0,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          data: {
            products: JSON.stringify(updatedProd),
          },
        };
        $.ajax(settings).done(function (response) {
          console.log(response);
        });
      }
    }
    if (checkbox.checkbox("is checked")) {
      totalPrice += p.id.price * quantity;
      productNum += quantity;
      checkedProducts.push(p);
    }
  });
  document.querySelector("#numOfProd").innerText = productNum;
  document.querySelector("#subtotal").innerText = "$" + totalPrice;
  console.log(checkedProducts);
}
document.querySelectorAll(".ui.checkbox").forEach(function (c) {
  c.addEventListener("click", () => {
    check(false);
  });
});
document.querySelectorAll("#first").forEach(function (c) {
  c.addEventListener("change", () => {
    check(true);
  });
});
document.querySelectorAll("#delete").forEach(function (c) {
  c.addEventListener("click", () => {
    var settings = {
      url: "/cart/" + c.name + "/delete",
      method: "POST",
      timeout: 0,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {},
    };
    $.ajax(settings).done(function (response) {
      console.log(response);
    });
    document.querySelectorAll(".item.cart").forEach(function (item) {
      if (item.id === c.name) {
        item.remove();
        products.forEach(function (p) {
          console.log(p.id._id);
          console.log(item.id);
          if (p.id._id === item.id) {
            console.log("()");
            products.splice(products.indexOf(p), 1);
          }
        });
        if ($(".item.cart").length === 0) {
          $("#sub").remove();
          $("#ch").remove();
          $(".hidden").removeClass("hidden");
        }
      }
    });
    check(false);
  });
});

window.onload(check(false));

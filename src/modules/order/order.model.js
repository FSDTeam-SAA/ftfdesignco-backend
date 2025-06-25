const { Schema, model } = require("mongoose");

const OrderModel = Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  shopId: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
});

const Order = model("Order", OrderModel);
module.exports = Order;

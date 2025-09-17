const { Schema, model } = require("mongoose");

const OrderModel = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee" },
    shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          // required: true,
        },
        title: { type: String },
        price: { type: Number },
        quantity: { type: Number },
        totalCoin: { type: Number },
        image: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "rejected", "delivered"],
      default: "pending",
    },
    country: { type: String },
    zipCode: { type: Number },
    name: { type: String },
    address: { type: String },
    totalPayCoin: { type: Number },
  },
  { timestamps: true }
);

const Order = model("Order", OrderModel);
module.exports = Order;

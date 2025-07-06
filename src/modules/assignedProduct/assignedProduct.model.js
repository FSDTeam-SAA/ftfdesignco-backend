const { Schema, model } = require("mongoose");

const assignedProduct = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  shopId: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

const AssignedProduct = model("AssignedProduct", assignedProduct);
module.exports = AssignedProduct;

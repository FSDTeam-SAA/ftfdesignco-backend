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
});

const AssignedProduct = model("AssignedProduct", assignedProduct);
module.exports = AssignedProduct;

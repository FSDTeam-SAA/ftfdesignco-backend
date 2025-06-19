const { Schema, model } = require("mongoose");

const ProductSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    productDescription: {
      type: String,
      required: true,
      trim: true,
    },
    productPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    productImage: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: String,
      required: false, // optional, unless you want to enforce subcategory selection
    },
    productSize: {
      type: String,
      required: false, // optional, unless you want to enforce size selection
    },
  },
  {
    timestamps: true,
  }
);

const ProductModel = model("Product", ProductSchema);
module.exports = ProductModel;

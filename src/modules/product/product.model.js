const { Schema, model } = require("mongoose");

const ProductSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 0,
    },
    productImage: {
      type: String,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    // subcategory: {
    //   type: String,
    //   required: false,
    // },
    // productSize: {
    //   type: String,
    //   required: false,
    // },
  },
  {
    timestamps: true,
  }
);

const Product = model("Product", ProductSchema);
module.exports = Product;

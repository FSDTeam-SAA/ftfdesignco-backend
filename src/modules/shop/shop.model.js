const { Schema, model } = require("mongoose");

const shopModel = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      //   required: true,
    },
    companyId: {
      type: String,
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    companyLogo: {
      type: String,
    },
    companyBanner: {
      type: String,
    },
    comapnyAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        productQuantity: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Shop = model("Shop", shopModel);
module.exports = Shop;

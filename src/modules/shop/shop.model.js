const { Schema, model } = require("mongoose");

const shopModel = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    subscriptionPlan: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
    },
    subscriptionStartDate: {
      type: Date,
    },
    subscriptionEndDate: {
      type: Date,
    },
    subscriptionEmployees: {
      type: Number,
      default: 0,
    },
    totalGivenCoin: {
      type: Number,
      default: 0,
    },
    totalUsedCoin: {
      type: Number,
      default: 0,
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
        coin: {
          //TODO:1 Coin per product it's set by admin.[It's will be changed in future.]
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

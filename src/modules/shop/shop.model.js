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
      trim: true,
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
    companyAddress: {
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Shop = model("Shop", shopModel);
module.exports = Shop;

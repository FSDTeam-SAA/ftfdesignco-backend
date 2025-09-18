const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    amount: { type: Number },
    totalProductPrice: { type: Number, default: 0 },
    transactionId: { type: String },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = { Payment };

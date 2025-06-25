const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPlan",
    required: true,
  },
  orderId: { type: mongoose.Schema.Types.ObjectId },
  amount: { type: Number },
  transactionId: { type: String },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = { Payment };

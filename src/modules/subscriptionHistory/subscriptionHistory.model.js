const { Schema, model } = require("mongoose");

const subscriptionHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan" },
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
});

const SubscriptionHistory = model(
  "SubscriptionHistory",
  subscriptionHistorySchema
);
module.exports = SubscriptionHistory;

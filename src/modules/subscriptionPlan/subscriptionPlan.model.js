const { Schema, model } = require("mongoose");

const subscriptionPlanSchema = new Schema(
  {
    title: {
      type: String,
      enum: ["Basic", "Standard", "Premium"],
      required: true,
      // unique: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    maxEmployees: {
      type: Number,
      required: [true, "Maximum number of employees is required"],
      min: [1, "At least one employee is required"],
    },
    features: {
      type: [String],
      default: [],
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: [true, "Billing cycle is required"],
    },
  },
  { timestamps: true, versionKey: false }
);

const SubscriptionPlan = model("SubscriptionPlan", subscriptionPlanSchema);
module.exports = SubscriptionPlan;

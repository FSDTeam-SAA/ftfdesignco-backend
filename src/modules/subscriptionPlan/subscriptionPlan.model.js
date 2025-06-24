const { Schema, model } = require('mongoose')

const subscriptionPlanSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    features: {
      type: [String],
      default: [],
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: [true, 'Billing cycle is required'],
    },
  },
  { timestamps: true, versionKey: false }
)

const SubscriptionPlan = model('SubscriptionPlan', subscriptionPlanSchema)
module.exports = SubscriptionPlan

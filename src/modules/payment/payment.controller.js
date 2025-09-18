const Stripe = require("stripe");

const { Payment } = require("../payment/payment.model");
const User = require("../user/user.model");
const Shop = require("../shop/shop.model");
const SubscriptionPlan = require("../subscriptionPlan/subscriptionPlan.model");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

const createPayment = async (req, res) => {
  const { userId } = req.user;
  const { planId, type, totalProductPrice = 0 } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  let amount = 0;
  if (type === "subscription") {
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    amount = plan.price;
  } else if (type === "payOrder") {
    amount = totalProductPrice;
  } else {
    return res.status(400).json({ error: "Invalid payment type" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: "usd",
      metadata: {
        userId,
        planId: planId || "",
        type,
        totalProductPrice,
      },
    });

    const payment = new Payment({
      userId,
      planId: type === "subscription" ? planId : null,
      shopId: type === "payOrder" ? user.shop : null,
      type,
      amount,
      totalProductPrice: type === "payOrder" ? totalProductPrice : 0,
      transactionId: paymentIntent.id,
      status: "pending",
    });

    await payment.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      message: "PaymentIntent created.",
    });
  } catch (error) {
    console.error("Error creating PaymentIntent:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// const confirmPayment = async (req, res) => {
//   const { paymentIntentId } = req.body;

//   if (!paymentIntentId) {
//     res.status(400).json({ error: "paymentIntentId is required." });
//     return;
//   }

//   const payment = await Payment.findOne({ transactionId: paymentIntentId });
//   if (!payment) throw new Error("Payment record not found");

//   try {
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//     if (paymentIntent.status === "succeeded") {
//       const paymentRecord = await Payment.findOneAndUpdate(
//         { transactionId: paymentIntentId },
//         { status: "success" },
//         { new: true }
//       );

//       const user = await User.findById(payment.userId);
//       if (!user) throw new Error("User not found");

//       await User.findOneAndUpdate(
//         { _id: paymentRecord.userId },
//         { $set: { isPaid: true } },
//         { new: true }
//       );

//       const plan = await SubscriptionPlan.findById();
//       if (!plan) throw new Error("Plan not found");

//       const shop = await Shop.findById(user.shop);
//       if (!shop) throw new Error("Shop not found");

//       const now = new Date();
//       let baseDate = now;

//       if (shop.subscriptionEndDate && shop.subscriptionEndDate > now) {
//         baseDate = new Date(shop.subscriptionEndDate);
//       }

//       let newEndDate = new Date(baseDate);

//       if (plan.billingCycle === "monthly") {
//         newEndDate.setMonth(newEndDate.getMonth() + 1);
//       } else if (plan.billingCycle === "yearly") {
//         newEndDate.setFullYear(newEndDate.getFullYear() + 1);
//       } else {
//         return res.status(400).json({ error: "Invalid billing cycle on plan" });
//       }

//       // ✅ Update shop subscription info
//       shop.subscriptionPlan = plan._id;
//       shop.subscriptionStartDate = shop.subscriptionStartDate || now;
//       shop.subscriptionEndDate = newEndDate;
//       shop.subscriptionEmployees =
//         (shop.subscriptionEmployees || 0) + plan.maxEmployees;

//       await shop.save();

//       res.status(200).json({
//         success: true,
//         message: "Payment successfully captured.",
//         paymentIntent,
//       });
//     } else {
//       await Payment.findOneAndUpdate(
//         { transactionId: paymentIntentId },
//         { status: "failed" }
//       );

//       res.status(400).json({
//         error: "Payment was not successful.",
//       });
//     }
//   } catch (error) {
//     console.error("Error confirming payment:", error);
//     res.status(500).json({
//       success: false,
//       code: 500,
//       error: "Internal server error.",
//     });
//   }
// };

const confirmPayment = async (req, res) => {
  const { paymentIntentId } = req.body;
  if (!paymentIntentId)
    return res.status(400).json({ error: "paymentIntentId is required" });

  const payment = await Payment.findOne({ transactionId: paymentIntentId });
  if (!payment)
    return res.status(404).json({ error: "Payment record not found" });

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      payment.status = "success";
      await payment.save();

      const user = await User.findById(payment.userId);
      if (!user) throw new Error("User not found");

      // Subscription payment
      if (payment.type === "subscription") {
        await User.findByIdAndUpdate(user._id, { isPaid: true });

        const plan = await SubscriptionPlan.findById(payment.planId);
        if (!plan) throw new Error("Plan not found");

        const shop = await Shop.findById(user.shop);
        if (!shop) throw new Error("Shop not found");

        const now = new Date();
        let baseDate =
          shop.subscriptionEndDate && shop.subscriptionEndDate > now
            ? new Date(shop.subscriptionEndDate)
            : now;

        let newEndDate = new Date(baseDate);
        if (plan.billingCycle === "monthly")
          newEndDate.setMonth(newEndDate.getMonth() + 1);
        else if (plan.billingCycle === "yearly")
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);

        shop.subscriptionPlan = plan._id;
        shop.subscriptionStartDate = shop.subscriptionStartDate || now;
        shop.subscriptionEndDate = newEndDate;
        shop.subscriptionEmployees =
          (shop.subscriptionEmployees || 0) + plan.maxEmployees;

        await shop.save();
      }

      // Order/product payment
      if (payment.type === "payOrder") {
        const shop = await Shop.findById(payment.shopId);
        if (!shop) throw new Error("Shop not found");

        shop.totalProductPaid =
          (shop.totalProductPaid || 0) + payment.totalProductPrice;
        await shop.save();
      }

      res.status(200).json({
        success: true,
        message: "Payment successfully captured",
        paymentIntent,
      });
    } else {
      payment.status = "failed";
      await payment.save();

      res
        .status(400)
        .json({ success: false, error: "Payment was not successful" });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  createPayment,
  confirmPayment,
};

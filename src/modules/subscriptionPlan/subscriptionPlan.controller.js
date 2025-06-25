const SubscriptionPlan = require("./subscriptionPlan.model");

exports.createPlan = async (req, res) => {
  try {
    const { title, description, price, maxEmployees, features, billingCycle } =
      req.body;

    if (title && !["Basic", "Standard", "Premium"].includes(title)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid plan title. Must be one of Basic, Standard, or Premium.",
      });
    }

    const result = await SubscriptionPlan.create({
      title,
      description,
      price,
      maxEmployees,
      features,
      billingCycle,
    });
    return res.status(201).json({
      success: true,
      code: 201,
      message: "Subscription plan created successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, code: 400, message: error.message });
  }
};

exports.getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find();
    res.status(200).json({
      success: true,
      code: 200,
      message: "Plans retrieved successfully",
      data: plans,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getSinglePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }
    res.status(200).json({
      success: true,
      message: "Plan retrieved successfully",
      data: plan,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, maxEmployees, features, billingCycle } =
      req.body;

    const planExists = await SubscriptionPlan.findById(id);
    if (!planExists) {
      return res
        .status(404)
        .json({ success: false, code: 404, message: "Plan not found" });
    }

    if (title && !["Basic", "Standard", "Premium"].includes(title)) {
      return res.status(400).json({
        success: false,
        code: 400,
        message:
          "Invalid plan title. Must be one of Basic, Standard, or Premium.",
      });
    }

    const plan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      {
        title,
        description,
        price,
        maxEmployees,
        features,
        billingCycle,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      code: 200,
      message: "Plan updated successfully",
      data: plan,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, code: 400, message: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }
    res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

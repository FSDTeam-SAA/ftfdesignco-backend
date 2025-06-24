const SubscriptionPlan = require('./subscriptionPlan.model')

exports.createPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.create(req.body)
    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      data: plan,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find()
    res.status(200).json({
      success: true,
      message: 'Plans retrieved successfully',
      data: plans,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.getSinglePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id)
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' })
    }
    res.status(200).json({
      success: true,
      message: 'Plan retrieved successfully',
      data: plan,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.updatePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' })
    }
    res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      data: plan,
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

exports.deletePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id)
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' })
    }
    res.status(200).json({
      success: true,
      message: 'Plan deleted successfully',
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

const express = require('express')
const {
  createPlan,
  getAllPlans,
  getSinglePlan,
  updatePlan,
  deletePlan,
} = require('./subscriptionPlan.controller.js')

const router = express.Router()

// Only admin users should manage plans
router.post('/', createPlan)
router.get('/', getAllPlans)
router.get('/:id', getSinglePlan)
router.put('/:id', updatePlan)
router.delete('/:id', deletePlan)

module.exports = router

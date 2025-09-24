const express = require("express");
const {
  createPlan,
  getAllPlans,
  getSinglePlan,
  updatePlan,
  deletePlan,
  getMySubscription,
} = require("./subscriptionPlan.controller.js");
const auth = require("../../middleware/auth.js");
const USER_ROLE = require("../user/user.constant.js");

const router = express.Router();

// Only admin users should manage plans
router.post("/", createPlan);
router.get("/", getAllPlans);

router.get(
  "/my-subscription",
  auth(USER_ROLE.company_admin),
  getMySubscription
);

router.get("/:id", getSinglePlan);
router.put("/:id", updatePlan);
router.delete("/:id", deletePlan);

module.exports = router;

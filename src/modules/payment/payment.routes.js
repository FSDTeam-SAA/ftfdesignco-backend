const express = require("express");
const { createPayment, confirmPayment } = require("./payment.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = express.Router();

router.post(
  "/create-payment",
  // auth(USER_ROLE.admin, USER_ROLE.company_admin, USER_ROLE.user),
  createPayment
);
router.post("/confirm-payment", confirmPayment);

const paymentRouter = router;
module.exports = paymentRouter;

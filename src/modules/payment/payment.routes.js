const express = require("express");
const { createPayment, confirmPayment } = require("./payment.controller");

const router = express.Router();

router.post("/create-payment", createPayment);
router.post("/confirm-payment", confirmPayment);

const paymentRouter = router;
module.exports = paymentRouter;

const { Router } = require("express");
const orderController = require("./order.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = Router();

router.post(
  "/create-order",
  auth(USER_ROLE.employee),
  orderController.orderProduct
);

router.get("/", auth(USER_ROLE.employee), orderController.getMyOrder);

const orderRouter = router;
module.exports = orderRouter;

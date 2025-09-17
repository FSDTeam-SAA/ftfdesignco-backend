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

router.get("/my-order", auth(USER_ROLE.employee), orderController.getMyOrder);
router.get("/", auth(USER_ROLE.admin), orderController.getAllOrders);

router.get(
  "/all-orders",
  auth(USER_ROLE.company_admin),
  orderController.getAllOrdersFromShop
);

router.put(
  "/status/:orderId",
  // auth(USER_ROLE.company_admin),
  orderController.placeOrderStatus
);

router.delete(
  "/remove-rejected-order/:orderId",
  auth(USER_ROLE.company_admin, USER_ROLE.employee),
  orderController.deletedRejectedOrder
);

const orderRouter = router;
module.exports = orderRouter;

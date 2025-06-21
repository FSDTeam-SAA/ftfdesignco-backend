const { Router } = require("express");
const requestProductController = require("./requestProduct.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = Router();

router.post(
  "/request",
  auth(USER_ROLE.company_admin, USER_ROLE.admin),
  requestProductController.addRequestProduct
);

const requestProduct = router;
module.exports = requestProduct;

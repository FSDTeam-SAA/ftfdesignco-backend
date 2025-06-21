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

router.get(
  "/",
  auth(USER_ROLE.company_admin, USER_ROLE.admin),
  requestProductController.getAllRequestProducts
);

router.get(
  "/own-requests",
  auth(USER_ROLE.company_admin, USER_ROLE.admin),
  requestProductController.getOwnRequestProducts
);

const requestProduct = router;
module.exports = requestProduct;

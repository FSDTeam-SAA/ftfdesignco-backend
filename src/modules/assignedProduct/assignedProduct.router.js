const { Router } = require("express");
const assignedProductController = require("./assignedProduct.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = Router();

router.get("/", assignedProductController.getAssignedProducts);

router.get(
  "/my-shop",
  auth(USER_ROLE.company_admin),
  assignedProductController.getMyShopAssigndedProducts
);

router.put(
  "/status/:assignedProductId",
  //   auth(USER_ROLE.company_admin),
  assignedProductController.toggleAssigndedProductStatus
);

router.delete(
  "/:assignedProductId",
    auth(USER_ROLE.company_admin),
  assignedProductController.removeProductFromShop
);

const assignedProduct = router;
module.exports = assignedProduct;

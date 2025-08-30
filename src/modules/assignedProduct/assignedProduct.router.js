const { Router } = require("express");
const assignedProductController = require("./assignedProduct.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = Router();

router.get("/", auth(USER_ROLE.company_admin), assignedProductController.getAssignedProducts);

router.get(
  "/my-shop",
  auth(USER_ROLE.company_admin),
  assignedProductController.getMyShopAssigndedProducts
);

router.get(
  "/my-shop/approved",
  auth(USER_ROLE.company_admin),
  assignedProductController.getMyShopApprovedProducts
);


router.put(
  "/status/:assignedProductId",
  auth(USER_ROLE.company_admin),
  assignedProductController.toggleAssigndedProductStatus
);

// this api some logic issue if anyone order then i cannot remove product from shop
router.delete(
  "/:assignedProductId",
  auth(USER_ROLE.company_admin),
  assignedProductController.removeProductFromShop
);

router.put(
  "/add-coin/:assignedProductId",
  auth(USER_ROLE.company_admin),
  assignedProductController.setCoinForProducts
);

const assignedProduct = router;
module.exports = assignedProduct;

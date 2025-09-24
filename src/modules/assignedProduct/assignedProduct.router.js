const { Router } = require("express");
const assignedProductController = require("./assignedProduct.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const router = Router();

router.get(
  "/",
  auth(USER_ROLE.admin),
  assignedProductController.getAssignedProducts
);

router.get(
  "/shop-products",
  auth(USER_ROLE.employee),
  assignedProductController.getAssignedProductForUser
);

router.get(
  "/my-shop",
  auth(USER_ROLE.company_admin),
  assignedProductController.getMyShopAssigndedProducts
);

router.get(
  "/my-shop/approved",
  auth(USER_ROLE.company_admin, USER_ROLE.employee),
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

router.put(
  "/shop-product/:assignedProductId",
  auth(USER_ROLE.company_admin),
  assignedProductController.cancelMyShopProduct
);

router.delete(
  "/cancel/:assignedProductId",
  // auth(USER_ROLE.company_admin),
  assignedProductController.deletedRejectedAssignedProduct
);

const assignedProduct = router;
module.exports = assignedProduct;

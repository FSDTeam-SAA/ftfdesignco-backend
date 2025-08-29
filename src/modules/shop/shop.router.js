const { Router } = require("express");
const shopController = require("./shop.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");
const { upload } = require("../../utils/cloudnary");

const router = Router();

router.post(
  "/create",
  auth(USER_ROLE.company_admin, USER_ROLE.admin, USER_ROLE.user),
  upload.fields([
    { name: "companyLogo", maxCount: 1 },
    { name: "companyBanner", maxCount: 1 },
  ]),
  (req, res, next) => {
    if (req.body?.data) {
      try {
        req.body = JSON.parse(req.body.data);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format in 'data' field",
        });
      }
    }
    next();
  },
  shopController.crateShop
);

router.get(
  "/my-shop",
  auth(USER_ROLE.company_admin, USER_ROLE.admin, USER_ROLE.employee),
  shopController.getShopDetails
);

router.get(
  "/:shopId",
  auth(USER_ROLE.company_admin, USER_ROLE.admin, USER_ROLE.user),
  shopController.shopDetails
);

// router.get("/", auth(USER_ROLE.admin), shopController.getAllShops);
router.get("/", shopController.getAllShops);

router.put(
  "/:shopId",
  auth(USER_ROLE.company_admin, USER_ROLE.admin, USER_ROLE.user),
  shopController.toggleShopStatus
);


const shopRouter = router;
module.exports = shopRouter;

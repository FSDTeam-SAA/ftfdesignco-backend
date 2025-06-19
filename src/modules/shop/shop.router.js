const { Router } = require("express");
const shopController = require("./shop.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");
const { upload } = require("../../utils/cloudnary");

const router = Router();

router.post(
  "/create",
  auth(USER_ROLE.company_admin, USER_ROLE.admin),
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
    // If no `data`, req.body remains an empty object or unchanged
    next();
  },
  shopController.crateShop
);

const shopRouter = router;
module.exports = shopRouter;

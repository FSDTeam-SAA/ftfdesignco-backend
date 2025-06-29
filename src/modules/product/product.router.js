const router = require("express").Router();
const { upload } = require("../../utils/cloudnary");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
} = require("./product.controller");

router.post(
  "/create",
  upload.single("productImage"),
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
  auth(USER_ROLE.admin),
  addProduct
);

router.get(
  "/get-all",
  // auth(USER_ROLE.admin, USER_ROLE.company_admin),
  getAllProducts
);
router.get(
  "/:productId",
  auth(USER_ROLE.admin, USER_ROLE.user),
  getProductById
);

router.put(
  "/:productId",
  upload.single("productImage"),
  (req, res, next) => {
    if (req.body?.data) {
      try {
        req.body = JSON.parse(req.body.data);
      } catch (err) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: "Invalid JSON format in 'data' field",
        });
      }
    }
    next();
  },
  auth(USER_ROLE.admin),
  updateProductById
);

router.delete("/:productId", auth(USER_ROLE.admin), deleteProductById);

const productRouter = router;
module.exports = productRouter;

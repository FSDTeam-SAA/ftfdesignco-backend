const router = require("express").Router();
const { upload } = require("../../utils/cloudnary");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

const {
  // getAllProduct,
  // getProductById,
  // updateProductById,
  // deleteProductById,
  addProduct,
  getAllProducts,
  getProductById,
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
    // If no `data`, req.body remains an empty object or unchanged
    next();
  },
  auth(USER_ROLE.admin),
  addProduct
);

router.get(
  "/get-all",
  auth(USER_ROLE.admin, USER_ROLE.company_admin),
  getAllProducts
);
router.get(
  "/:productId",
  auth(USER_ROLE.admin, USER_ROLE.user),
  getProductById
);

// router.put(
//   "/:id",
//   upload.single("productImage"),
//   (req, res, next) => {
//     req.body = JSON.parse(req.body.data);
//     next();
//   },
//   auth(USER_ROLE.admin),
//   updateProductById
// );

// // Delete product by ID
// router.delete("/:id", auth(USER_ROLE.admin), deleteProductById);

const productRouter = router;
module.exports = productRouter;

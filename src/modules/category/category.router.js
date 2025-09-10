const express = require("express");
const router = express.Router();
const { upload } = require("../../utils/cloudnary");
const {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  getCategoryProducts,
  deleteCategory,
} = require("./category.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

router.post(
  "/create",
  upload.single("thumbnail"),
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
  createCategory
);

router.get(
  "/",
  // auth(USER_ROLE.admin, USER_ROLE.employee, USER_ROLE.company_admin),
  getAllCategory
);

router.get(
  "/:categoryId",
  // auth(USER_ROLE.admin, USER_ROLE.employee, USER_ROLE.company_admin),
  getCategoryById
);

router.get(
  "/categori-products/:categoryId",
  // auth(USER_ROLE.admin, USER_ROLE.employee, USER_ROLE.company_admin),
  getCategoryProducts
);

router.put(
  "/:categoryId",
  upload.single("thumbnail"),
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
  updateCategory
);

router.delete("/remove/:categoryId", auth(USER_ROLE.admin), deleteCategory);

const categoryRouter = router;
module.exports = categoryRouter;

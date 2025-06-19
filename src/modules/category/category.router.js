const express = require("express");
const router = express.Router();
const { upload } = require("../../utils/cloudnary");
const {
  createCategory,
  getAllCategory,
  getCategoryById,
} = require("./category.controller");
const auth = require("../../middleware/auth");
const USER_ROLE = require("../user/user.constant");

//------------------------- Category Router-------------------------
// Create category
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
// Get all categories
router.get(
  "/",
  auth(USER_ROLE.admin, USER_ROLE.employee, USER_ROLE.company_admin),
  getAllCategory
);

// Get category by ID
router.get(
  "/:categoryId",
  auth(USER_ROLE.admin, USER_ROLE.employee, USER_ROLE.company_admin),
  getCategoryById
);

// Update category by ID
router.put(
  "/:id",
  upload.single("categoryThumbnail"),
  (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  auth(USER_ROLE.admin),
  getCategoryById
);
// Delete category by ID
router.delete("/:id", auth(USER_ROLE.admin), getCategoryById);

const categoryRouter = router;
module.exports = categoryRouter;
